'use strict'

const _ = require('lodash')
const express = require('express')
const isPromise = require('is-promise')
const jsonschema = require('jsonschema')
const openApiToJsonschema = require('openapi-jsonschema-parameters')
const Promise = require('bluebird')

const serverTemplates = require('../../templates/server')

const Api = function (core, middlewares) {
  const templates = core.utils.templates.compile(serverTemplates)
  const router = express.Router()
  const jsonSchemaValidator = new jsonschema.Validator()
  const methods = {
    get: {
      statusCode: 200,
      responseBody: true
    },
    delete: {
      statusCode: 204,
      responseBody: false
    },
    put: {
      statusCode: [204, 201],
      responseBody: [false, true]
    },
    patch: {
      statusCode: 204,
      responseBody: false
    },
    post: {
      statusCode: 201,
      responseBody: true
    },
    options: {
      statusCode: 200,
      responseBody: true
    }
  }
  let routes = {}
  let operations = {}
  let openApi = {
    tags: [],
    paths: {},
    definitions: {}
  }
  let getRouterPromise

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
    const headers = responseCustomizator.header()
    const statusCode = responseCustomizator.status() || (_.isArray(methodToUse.statusCode) ? methodToUse.statusCode[0] : methodToUse.statusCode)
    const responseBody = _.isArray(methodToUse.responseBody) ? methodToUse.responseBody[methodToUse.statusCode.indexOf(statusCode)] : methodToUse.responseBody

    return {
      headers: headers,
      responseBody: responseBody,
      statusCode: statusCode
    }
  }

  const SendResponse = function (methodToUse, responseCustomizator) {
    const sendResponse = function (req, res, response) {
      const statusHeadersAndResponse = getStatusHeadersAndResponse(responseCustomizator, methods[methodToUse])
      _.each(statusHeadersAndResponse.headers, (header) => {
        res.set(header.key, header.value)
      })
      res.status(statusHeadersAndResponse.statusCode)
      if (statusHeadersAndResponse.responseBody) {
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
    _.each(jsonSchema, parse)
    return jsonSchema
  }

  const ParamsValidator = function (route) {
    let jsonSchemaParams = parseJsonschema(openApiToJsonschema(route.parameters || []))
    return function (req) {
      const validation = {
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
    const methodProperties = methods[methodToUse]
    const allowedStatusCodes = _.isArray(methodProperties.statusCode) ? methodProperties.statusCode : [methodProperties.statusCode]
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

    if (!methods[methodToUse]) {
      return Promise.reject(new core.errors.MethodNotAllowed(templates.methodNotAllowedError({
        method: methodToUse
      })))
    }

    routes[route.path] = routes[route.path] || {}
    routes[route.path][methodToUse] = route

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

  const addDefinitions = function (definitionsToAdd) {
    let alreadyExists
    _.each(definitionsToAdd, (definitionProperties, definitionId) => {
      if (openApi.definitions[definitionId]) {
        alreadyExists = Promise.reject(new core.errors.Conflict(templates.apiAlreadyExistsError({
          item: 'definition',
          name: definitionId
        })))
      } else {
        jsonSchemaValidator.addSchema(definitionProperties, '/definitions/' + definitionId)
        openApi.definitions[definitionId] = definitionProperties
      }
    })
    return alreadyExists || Promise.resolve(definitionsToAdd)
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
      addDefinitions(openApiDefinition.definitions)
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

  const addOptionsMethod = function (route, methods) {
    const sendResponse = new SendResponse('options')
    route.options((req, res, next) => {
      res.set({
        'Allow': _.map(_.keys(methods), (method) => {
          return method.toUpperCase()
        }).join(', ')
      })
      sendResponse(req, res, methods)
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

  const getResponsesDefinitions = function () {
    return Promise.resolve(methods)
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
    getResponsesDefinitions: getResponsesDefinitions,
    getOpenApi: getOpenApi,
    initRouter: initRouter
  }
}

module.exports = Api
