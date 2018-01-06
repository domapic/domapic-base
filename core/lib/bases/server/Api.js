'use strict'

const _ = require('lodash')
const express = require('express')
const isPromise = require('is-promise')
const jsonschema = require('jsonschema')
const openApiToJsonschema = require('openapi-jsonschema-parameters')
const Promise = require('bluebird')

const serverTemplates = require('../../templates/server')
const methodsSchemas = require('./definitions/methods')

const APP_JSON = 'application/json'
const CONTENT_SCHEMA_TAG = 'x-json-content-schema'

const Api = function (core, middlewares) {
  const templates = core.utils.templates.compile(serverTemplates)
  const router = express.Router()
  const jsonSchemaValidator = new jsonschema.Validator()
  let routes = {}
  let operations = {}
  let openApi = {
    tags: [],
    paths: {},
    schemas: {}
  }
  let parsedOpenApi
  let getRouterPromise

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

  const getStatusHeadersAndResponse = function (responseCustomizator, methodToUse) {
    const statusCode = responseCustomizator.status() || Number(_.keys(methodToUse)[0])
    return {
      statusCode: statusCode,
      headers: responseCustomizator.header(),
      responseContent: methodToUse[statusCode].responseContent
    }
  }

  const SendResponse = function (methodToUse, responseCustomizator) {
    const sendResponse = function (req, res, response) {
      const statusHeadersAndResponse = getStatusHeadersAndResponse(responseCustomizator, methodsSchemas[methodToUse])
      _.each(statusHeadersAndResponse.headers, (header) => {
        res.set(header.key, header.value)
      })
      res.status(statusHeadersAndResponse.statusCode)
      if (statusHeadersAndResponse.responseContent) {
        middlewares.sendResponse(req, res, response)
      } else {
        middlewares.sendResponse(req, res)
      }
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

  const requestBodyIsMandatory = function (methodName) {
    return !!methodsSchemas[methodName].requestBody
  }

  const ParamsValidator = function (route) {
    const mandatoryBody = requestBodyIsMandatory(route.method)
    const jsonSchemaParams = parseJsonschema(openApiToJsonschema(route.parameters || []))

    if (mandatoryBody) {
      if (route.requestBody && route.requestBody.content && route.requestBody.content[APP_JSON] && route.requestBody.content[APP_JSON].schema) {
        jsonSchemaParams.body = parseJsonschema(route.requestBody.content[APP_JSON].schema)
      } else if (route.requestBody && route.requestBody[CONTENT_SCHEMA_TAG]) {
        jsonSchemaParams.body = parseJsonschema(route.requestBody[CONTENT_SCHEMA_TAG])
      } else if (route[CONTENT_SCHEMA_TAG]) {
        jsonSchemaParams.body = parseJsonschema(route[CONTENT_SCHEMA_TAG])
      }
    }

    return function (req) {
      let validation
      if (mandatoryBody && _.isEmpty(req.body)) {
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
        return Promise.reject(new core.errors.BadImplementation(templates.noHandlerDefinedError({
          operationId: operationId
        })))
      }
      return Promise.resolve(operations[operationId].handler({
        params: req.params,
        body: req.body,
        query: req.query
      }, responseCustomizator, core))
    }
  }

  const ResponseCustomizator = function (methodToUse) {
    const allowedStatusCodes = _.keys(methodsSchemas[methodToUse])
    let headers = []
    let statusToSet

    const status = function (statusCode) {
      if (_.isUndefined(statusCode)) {
        return statusToSet
      }
      if (_.indexOf(allowedStatusCodes, statusCode) > -1) {
        statusToSet = statusCode
      } else {
        throw new core.errors.BadImplementation(
          templates.responseStatusNotAllowedError({method: methodToUse, statusCode: statusCode, allowedStatusCodes: allowedStatusCodes})
        )
      }
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

  const addRoute = function (route) {
    const methodToUse = route.method.toLowerCase()
    const parseParameters = new ParametersParser(route.operationId)
    const validateParameters = new ParamsValidator(route)
    const responseCustomizator = new ResponseCustomizator(methodToUse)
    const executeAction = new ActionExecutor(route.operationId, responseCustomizator)
    const sendResponse = new SendResponse(methodToUse, responseCustomizator)

    if (!methodsSchemas[methodToUse]) {
      return Promise.reject(new core.errors.MethodNotAllowed(templates.methodNotAllowedError({
        method: methodToUse
      })))
    }

    routes[route.path] = routes[route.path] || {}
    routes[route.path][methodToUse] = route
    // About security, maybe it is better to use a middleware for all api methods, instead of adding it to every call ...
    // Securize all, but custom with roles and users (*)
    router.route(route.path)[methodToUse](/* TODO, add authorization handler */ (req, res, next) => {
      return parseParameters(req)
        .then(validateParameters)
        .then(executeAction)
        .catch((err) => {
          next(err)
          return Promise.reject(err)
        })
        .then((response) => {
          if (isPromise(response)) {
            response.catch((err) => {
              next(err)
              return Promise.reject(err)
            }).then((result) => {
              sendResponse(req, res, result)
              return Promise.resolve()
            })
          } else {
            sendResponse(req, res, response)
            return Promise.resolve()
          }
        }).catch(() => {
        })
    })

    return Promise.resolve(route)
  }

  const addRoutePaths = function (paths) {
    const routesPathsToAdd = _.flatten(_.map(paths, (pathsMethods, routePath) => {
      return _.map(pathsMethods, (pathProperties, method) => {
        return _.extend({}, pathProperties, {
          method: method,
          path: routePath
        })
      })
    }))
    return Promise.map(routesPathsToAdd, addRoute)
  }

  const addPaths = function (paths) {
    let alreadyExists
    _.each(paths, (pathMethods, routePath) => {
      _.each(pathMethods, (methodProperties, methodName) => {
        openApi.paths[routePath] = openApi.paths[routePath] || {}
        if (openApi.paths[routePath][methodName]) {
          alreadyExists = Promise.reject(new core.errors.Conflict(templates.apiAlreadyExistsError({
            item: 'path',
            name: routePath + ' ' + methodName
          })))
        } else {
          _.extend(openApi.paths[routePath][methodName] = methodProperties)
        }
      })
    })
    return alreadyExists || Promise.resolve(paths)
  }

  const addRoutesAndPaths = function (pathsToAdd) {
    return Promise.all([
      addRoutePaths(pathsToAdd),
      addPaths(JSON.parse(JSON.stringify(pathsToAdd)))
    ])
  }

  const addSchemas = function (schemasToAdd) {
    let alreadyExists
    _.each(schemasToAdd, (schemaProperties, schemaId) => {
      if (openApi.schemas[schemaId]) {
        alreadyExists = Promise.reject(new core.errors.Conflict(templates.apiAlreadyExistsError({
          item: 'schema',
          name: schemaId
        })))
      } else {
        jsonSchemaValidator.addSchema(schemaProperties, '/components/schemas/' + schemaId)
        openApi.schemas[schemaId] = schemaProperties
      }
    })
    return alreadyExists || Promise.resolve(schemasToAdd)
  }

  const addTag = function (tag) {
    const similarTag = _.filter(openApi.tags, (existantTag) => {
      return existantTag.name === tag.name
    })
    if (similarTag.length) {
      return Promise.reject(new core.errors.Conflict(templates.apiAlreadyExistsError({
        item: 'tag',
        name: tag.name
      })))
    }
    openApi.tags.push(tag)
    return Promise.resolve(tag)
  }

  const addTags = function (tagsToAdd) {
    tagsToAdd = _.isArray(tagsToAdd) ? tagsToAdd : [tagsToAdd]
    return Promise.map(tagsToAdd, addTag)
  }

  const addOpenApi = function (openApiDefinition) {
    if (!openApiDefinition) {
      return Promise.resolve()
    }
    return Promise.all([
      addRoutesAndPaths(openApiDefinition.paths),
      addTags(openApiDefinition.tags),
      addSchemas(openApiDefinition.schemas)
    ])
  }

  const addOperations = function (operationsDefinitions) {
    let alreadyExists
    _.each(operationsDefinitions, (operationProperties, operationId) => {
      if (operations[operationId]) {
        alreadyExists = Promise.reject(new core.errors.Conflict(templates.apiAlreadyExistsError({
          item: 'operation',
          name: operationId
        })))
      } else {
        operations[operationId] = operationProperties
      }
    })
    return alreadyExists || Promise.resolve(operationsDefinitions)
  }

  const addApi = function (apiDefinitions) {
    return ensureRouterNotInitialized()
      .then(() => {
        apiDefinitions = _.isArray(apiDefinitions) ? apiDefinitions : [apiDefinitions]
        return Promise.map(apiDefinitions, (apiDefinition) => {
          return Promise.all([
            addOpenApi(apiDefinition.openApi),
            addOperations(apiDefinition.operations)
          ])
        })
      })
  }

  const getOpenApi = function () {
    return Promise.resolve(openApi)
  }

  const setParsedOpenApi = function (openApi) {
    parsedOpenApi = JSON.parse(JSON.stringify(openApi).replace(/#/g, '/doc/api/openapi.json#'))
    return Promise.resolve(openApi)
  }

  const addOptionsMethod = function (route, methods) {
    const methodToUse = 'options'
    const responseCustomizator = new ResponseCustomizator(methodToUse)
    const sendResponse = new SendResponse(methodToUse, responseCustomizator)
    route.options((req, res, next) => {
      res.set({
        'Allow': _.map(_.keys(methods), (method) => {
          return method.toUpperCase()
        }).join(', ')
      })
      sendResponse(req, res, parsedOpenApi.paths[route.path])
    })
    return Promise.resolve(route)
  }

  const addMethodsHandling = function (routes) {
    return Promise.map(_.keys(routes), (route) => {
      return addOptionsMethod(router.route(route), routes[route])
        .then(() => {
          return middlewares.addMethodNotAllowed(router.route(route))
        })
    })
  }

  const initRouter = function () {
    if (!getRouterPromise) {
      getRouterPromise = addMethodsHandling(routes)
      .then(() => {
        return Promise.resolve(router)
      })
    }
    return getRouterPromise
  }

  return {
    addApi: addApi,
    getOpenApi: getOpenApi,
    setParsedOpenApi: setParsedOpenApi,
    initRouter: initRouter
  }
}

module.exports = Api
