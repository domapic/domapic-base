'use strict'

const _ = require('lodash')
const express = require('express')
const isPromise = require('is-promise')
const jsonschema = require('jsonschema')
const openApiToJsonschema = require('openapi-jsonschema-parameters')
const Promise = require('bluebird')

const Security = require('./Security')
const OpenApi = require('./OpenApi')

const APP_JSON = 'application/json'

const deepClone = function (data) {
  return JSON.parse(JSON.stringify(data))
}

const Api = function (core, middlewares, securityMethods) {
  const templates = core.utils.templates.compiled.server
  const supportedSecurityMethods = {}
  const openApi = new OpenApi(core)
  const router = express.Router()
  const jsonSchemaValidator = new jsonschema.Validator()
  let getRouterPromise
  let authorizationRoles = {}
  let security
  let operations = {}

  router.use(middlewares.sendOnlyJson)

  const ensureRouterNotInitialized = function () {
    if (getRouterPromise) {
      return Promise.reject(new core.errors.Conflict(templates.routerAlreadyInitializedError()))
    }
    return Promise.resolve()
  }

  const getValidationMessage = function (validation) {
    return _.map(validation.errors, (error) => {
      return templates.bodyPropertiesValidationError({
        property: error.property,
        message: error.message
      })
    }).join('. ')
  }

  const getStatusHeadersAndResponse = function (responseCustomizator) {
    const statusCode = responseCustomizator.status() || 200
    return {
      statusCode: statusCode,
      headers: responseCustomizator.header()
    }
  }

  const SendResponse = function (methodToUse, responseCustomizator) {
    const sendResponse = function (req, res, response) {
      const statusHeadersAndResponse = getStatusHeadersAndResponse(responseCustomizator)
      _.each(statusHeadersAndResponse.headers, (header) => {
        res.set(header.key, header.value)
      })
      res.status(statusHeadersAndResponse.statusCode)
      middlewares.sendResponse(req, res, response)
    }
    return sendResponse
  }

  const parseJsonschema = function (jsonSchema) {
    const parse = function (jsonSchemaProps) {
      if (jsonSchemaProps['$ref']) {
        jsonSchemaProps['$ref'] = jsonSchemaProps['$ref'].replace('#', '')
      }
      if (_.isObject(jsonSchemaProps)) {
        _.each(jsonSchemaProps, parse)
      }
    }
    parse(jsonSchema)
    return jsonSchema
  }

  const toOpenApi2 = function (parameters) {
    _.each(parameters, (parameter) => {
      if (parameter.schema) {
        _.extend(parameter, parameter.schema)
        delete parameter.schema
      }
    })
    return parameters
  }

  const ParamsValidator = function (methodDefinition) {
    const jsonSchemaParams = openApiToJsonschema(toOpenApi2(_.clone(methodDefinition.parameters) || []))
    let requiredRequestBody = methodDefinition.requestBody && methodDefinition.requestBody.required

    if (methodDefinition.requestBody && methodDefinition.requestBody.content && methodDefinition.requestBody.content[APP_JSON] && methodDefinition.requestBody.content[APP_JSON].schema) {
      jsonSchemaParams.body = parseJsonschema(_.clone(methodDefinition.requestBody.content[APP_JSON].schema))
    }

    return function (req) {
      let validation
      if (requiredRequestBody && _.isEmpty(req.body)) {
        return Promise.reject(new core.errors.BadData(templates.bodyEmptyValidationError()))
      }
      validation = {
        errors: _.flatten(_.map([
          jsonSchemaValidator.validate(req.body, jsonSchemaParams.body || {}),
          jsonSchemaValidator.validate(req.query, jsonSchemaParams.query || {}),
          jsonSchemaValidator.validate(req.params, jsonSchemaParams.path || {})
        ], (validationResult) => {
          return validationResult.errors || []
        }))
      }
      if (validation.errors && validation.errors.length) {
        return Promise.reject(new core.errors.BadData(getValidationMessage(validation)))
      }
      return Promise.resolve(req)
    }
  }

  const ParametersParser = function (operationId) {
    return function (req) {
      if (operations[operationId]) {
        _.each(operations[operationId].parse, (parsers, reqObject) => {
          _.each(parsers, (parseFunc, reqObjectId) => {
            if (req[reqObject] && req[reqObject][reqObjectId]) {
              req[reqObject][reqObjectId] = parseFunc(req[reqObject][reqObjectId])
            }
          })
        })
      }
      return Promise.resolve(req)
    }
  }

  const ActionExecutor = function (operationId, responseCustomizator) {
    return function (req) {
      if (!operations[operationId] || !operations[operationId].handler) {
        return Promise.reject(new core.errors.BadImplementation(templates.operationIdNotFoundError({
          operationId: operationId
        })))
      }
      return Promise.resolve(operations[operationId].handler({
        path: req.params,
        query: req.query
      }, req.body, responseCustomizator))
    }
  }

  const ResponseCustomizator = function () {
    let headers = []
    let statusToSet

    const status = function (statusCode) {
      if (_.isUndefined(statusCode)) {
        return statusToSet
      }
      statusToSet = statusCode
    }

    const header = function (header, value) {
      if (_.isUndefined(header)) {
        return headers
      }
      headers.push({
        key: header,
        value: value
      })
    }

    return {
      status: status,
      header: header
    }
  }

  const addRouteMethod = function (methodDefinition, method, routePath) {
    const methodToUse = method.toLowerCase()
    const responseCustomizator = new ResponseCustomizator()
    const executeAction = new ActionExecutor(methodDefinition.operationId, responseCustomizator)
    const parseParameters = new ParametersParser(methodDefinition.operationId)
    const validateParameters = new ParamsValidator(methodDefinition)
    const sendResponse = new SendResponse(method, responseCustomizator)

    router.route(routePath)[methodToUse](new middlewares.OperationId(methodDefinition.operationId))

    if (methodDefinition.security && !_.isEmpty(methodDefinition.security)) {
      router.route(routePath)[methodToUse](new security.Middleware(methodDefinition.security, operations[methodDefinition.operationId] && operations[methodDefinition.operationId].auth, routePath, method))
    }

    router.route(routePath)[methodToUse]((req, res, next) => {
      return parseParameters(req)
        .then(validateParameters)
        .then(executeAction)
        .then((response) => {
          if (isPromise(response)) {
            return response.then((result) => {
              sendResponse(req, res, result)
              return Promise.resolve()
            })
          } else {
            sendResponse(req, res, response)
            return Promise.resolve()
          }
        }).catch((err) => {
          next(err)
        })
    })

    return Promise.resolve(methodDefinition)
  }

  const addRoute = function (routeDefinition, routePath) {
    return Promise.map(_.keys(routeDefinition), (method) => {
      if (method === 'options') {
        return Promise.resolve()
      }
      return addRouteMethod(routeDefinition[method], method, routePath)
    }).then(() => {
      // Add options method
      const parsedRouteDefinition = deepClone(routeDefinition).replace(/#/g, '/api/openapi.json#')
      router.route(routePath).options((req, res) => {
        res.status(200)
        middlewares.sendResponse(req, res, parsedRouteDefinition)
      })

      router.route(routePath).all(middlewares.methodNotAllowed)
      return Promise.resolve(routeDefinition)
    })
  }

  const openApiPathToExpress = function (path) {
    const regex = /(\/){(\S*?)}(\/|$)/g

    while ((regex.exec(path)) !== null) {
      path = path.replace(regex, '$1:$2$3')
    }
    return path
  }

  const addRoutes = function (openApiDefinition) {
    return Promise.map(_.keys(openApiDefinition.paths), (routePath) => {
      return addRoute(openApiDefinition.paths[routePath], openApiPathToExpress(routePath))
    })
  }

  const addOperation = function (operationProperties, operationId) {
    return ensureRouterNotInitialized()
      .then(() => {
        if (operations[operationId]) {
          return Promise.reject(new core.errors.Conflict(templates.apiAlreadyExistsError({
            item: 'operation',
            name: operationId
          })))
        } else {
          operations[operationId] = operationProperties
          return Promise.resolve(operationProperties)
        }
      })
  }

  const addOperations = function (operationsDefinitions) {
    return Promise.map(_.keys(operationsDefinitions), (operationId) => {
      return addOperation(operationsDefinitions[operationId], operationId)
    })
  }

  const addOpenApiRoute = function (openApiDefinition) {
    router.route('/openapi.json').get((req, res) => {
      res.status(200)
      middlewares.sendResponse(req, res, openApiDefinition)
    })
    return Promise.resolve(deepClone(openApiDefinition))
  }

  const initSecurity = function () {
    security = new Security(core, supportedSecurityMethods, authorizationRoles)
    return Promise.resolve()
  }

  const extendOpenApi = function (openApiDefinition) {
    return ensureRouterNotInitialized()
      .then(() => {
        if (openApiDefinition.components && openApiDefinition.components.schemas) {
          _.each(openApiDefinition.components.schemas, (schemaProperties, schemaId) => {
            jsonSchemaValidator.addSchema(parseJsonschema(deepClone(schemaProperties)), '/components/schemas/' + schemaId)
          })
        }
        return openApi.extend(openApiDefinition)
      })
  }

  const addAuthenticationOperations = function (authenticationOptions, method) {
    return securityMethods[method].set(authenticationOptions)
      .then(() => {
        return addOperations(securityMethods[method].operations)
      })
  }

  const addAuthentication = function (authentications) {
    return ensureRouterNotInitialized()
      .then(() => {
        return Promise.map(_.keys(authentications), (method) => {
          if (!securityMethods[method]) {
            return Promise.reject(new core.errors.BadImplementation(templates.wrongAuthenticationMethod({
              method: method,
              supported: _.keys(securityMethods)
            })))
          }
          return extendOpenApi(securityMethods[method].openApi)
            .then(() => {
              return addAuthenticationOperations(authentications[method], method)
            }).then(() => {
              supportedSecurityMethods[method] = securityMethods[method]
              return Promise.resolve(authentications[method])
            })
        })
      })
  }

  const addAuthorization = function (roleName, authHandler) {
    return ensureRouterNotInitialized()
      .then(() => {
        if (authorizationRoles[roleName]) {
          return Promise.reject(templates.authorizationRoleAlreadyDefinedError({roleName: roleName}))
        }
        authorizationRoles[roleName] = authHandler
        return Promise.resolve()
      })
  }

  const initRouter = function () {
    if (!getRouterPromise) {
      getRouterPromise = initSecurity()
        .then(openApi.get)
        .then(addOpenApiRoute)
        .then(addRoutes)
        .then(() => {
          return Promise.resolve(router)
        })
    }
    return getRouterPromise
  }

  return {
    addAuthentication: addAuthentication,
    addAuthorization: addAuthorization,
    addOperations: addOperations,
    extendOpenApi: extendOpenApi,
    initRouter: initRouter
  }
}

module.exports = Api
