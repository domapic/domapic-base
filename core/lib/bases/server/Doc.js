'use strict'

const path = require('path')

const _ = require('lodash')
const express = require('express')
const hbs = require('hbs')
const Promise = require('bluebird')

const openApiBase = require('./definitions/openapi.json')
const openapiTemplates = require('../../templates/openapi')
const methodsSchema = require('./definitions/methods')
const securitySchemes = require('./definitions/securitySchemes')

const APP_JSON = 'application/json'
const CONTENT_SCHEMA_TAG = 'x-json-content-schema'

const template = function (source, data) {
  return hbs.compile(source)(_.isObject(data) ? data : {data: data})
}

const Docs = function (options, core, middlewares, api) {
  const templates = core.utils.templates.compile(openapiTemplates) // TODO, compile all in utils
  let getRouterPromise
  let openApiDocPromise

  const addOpenApiInfo = function (openapi, configuration) {
    let authenticationMethod = {}
    authenticationMethod[options.authenticationMethod] = []
    openapi.security.push(authenticationMethod)

    openapi.components.securitySchemes[options.authenticationMethod] = securitySchemes[options.authenticationMethod]

    openapi.info.version = template(openapi.info.description, '1.0.0')
    openapi.info.title = template(openapi.info.title, configuration.name)
    openapi.info.description = template(openapi.info.description, 'Domapic service') // TODO From options
    // TODO, read from package.json
    // TODO, add contact and license from package.json
    // ID storage
    /* "contact": {
      "name": "Swagger API Team",
      "email": "foo@example.com",
      "url": "http://domapic.com"
    },
    "license": {
      "name": "MIT",
      "url": "http://github.com/gruntjs/grunt/blob/master/LICENSE-MIT"
    } */
    openapi.servers[0].url = template(openapi.servers[0].url, {
      protocol: configuration.sslKey ? 'https' : 'http',
      host: 'localhost',
      port: configuration.port
    })

    return Promise.resolve(openapi)
  }

  const requestBodyIsMandatory = function (methodName) {
    return !!methodsSchema[methodName].requestBody
  }

  const mustHaveResponseContent = function (statusCodeProperties) {
    return !!statusCodeProperties.responseContent
  }

  const mustHaveResponseHeaders = function (statusCodeProperties) {
    return !!statusCodeProperties.headers && !!statusCodeProperties.headers.length
  }

  const mustHaveBadDataResponse = function (methodObject) {
    return !!methodObject.parameters || !!methodObject.requestBody
  }

  const extendOpenApiRequestBody = function (methodObject, methodName) {
    if (requestBodyIsMandatory(methodName)) {
      methodObject.requestBody = methodObject.requestBody || {}
      methodObject.requestBody.required = true

      // Add content schema
      methodObject.requestBody.content = methodObject.requestBody.content || {}
      methodObject.requestBody.content[APP_JSON] = methodObject.requestBody.content[APP_JSON] || {}

      if (!methodObject.requestBody.content[APP_JSON].schema) {
        if (methodObject.requestBody[CONTENT_SCHEMA_TAG]) {
          methodObject.requestBody.content[APP_JSON].schema = methodObject.requestBody[CONTENT_SCHEMA_TAG]
          delete methodObject.requestBody[CONTENT_SCHEMA_TAG]
        } else if (methodObject[CONTENT_SCHEMA_TAG]) {
          methodObject.requestBody.content[APP_JSON].schema = methodObject[CONTENT_SCHEMA_TAG]
        } else {
          throw new core.errors.BadData(templates.noPropertyValidationError({
            property: 'requestBody schema',
            method: methodName
          }))
        }
      }
    }
  }

  const extendOpenApiResponse = function (methodObject, methodName, statusCodeProperties, statusCode) {
    methodObject.responses = methodObject.responses || {}
    methodObject.responses[statusCode] = methodObject.responses[statusCode] || {}
    methodObject.responses[statusCode].description = methodObject.responses[statusCode].description || statusCodeProperties.description

    // Add content schema
    if (mustHaveResponseContent(statusCodeProperties) && !methodObject.responses[statusCode]['$ref']) {
      methodObject.responses[statusCode].content = methodObject.responses[statusCode].content || {}
      methodObject.responses[statusCode].content[APP_JSON] = methodObject.responses[statusCode].content[APP_JSON] || {}

      if (!methodObject.responses[statusCode].content[APP_JSON].schema) {
        if (methodObject.responses[statusCode][CONTENT_SCHEMA_TAG]) {
          methodObject.responses[statusCode].content[APP_JSON].schema = methodObject.responses[statusCode][CONTENT_SCHEMA_TAG]
          delete methodObject.responses[statusCode][CONTENT_SCHEMA_TAG]
        } else if (methodObject[CONTENT_SCHEMA_TAG]) {
          methodObject.responses[statusCode].content[APP_JSON].schema = methodObject[CONTENT_SCHEMA_TAG]
        } else {
          throw new core.errors.BadData(templates.noPropertyValidationError({
            property: statusCode + ' response schema',
            method: methodName
          }))
        }
      }
    }

    if (mustHaveResponseHeaders(statusCodeProperties)) {
      methodObject.responses[statusCode].headers = methodObject.responses[statusCode].headers || {}
      _.each(statusCodeProperties.headers, (headerName) => {
        if (!methodObject.responses[statusCode].headers[headerName]) {
          methodObject.responses[statusCode].headers[headerName] = {
            '$ref': '#/components/headers/' + headerName.replace(/-/g, '')
          }
        }
      })
    }
  }

  const extendErrorResponses = function (methodObject) {
    methodObject.responses = methodObject.responses || {}
    if (mustHaveBadDataResponse(methodObject)) {
      methodObject.responses['422'] = {
        '$ref': '#/components/responses/BadDataError'
      }
    }
    methodObject.responses['500'] = {
      '$ref': '#/components/responses/UnexpectedError'
    }
  }

  const extendOpenApiResponses = function (methodObject, methodName) {
    extendErrorResponses(methodObject)
    _.each(methodsSchema[methodName], (statusCodeProperties, statusCode) => {
      if (statusCode !== 'requestBody') {
        extendOpenApiResponse(methodObject, methodName, statusCodeProperties, statusCode)
      }
    })
  }

  const addOpenApiMethod = function (methodProperties, methodName, pathObject) {
    pathObject[methodName] = {}
    // summary
    if (!methodProperties.summary && !methodProperties.description) {
      throw new core.errors.BadData(templates.noPropertyValidationError({
        property: 'summary or description',
        method: methodName
      }))
    }
    pathObject[methodName].summary = methodProperties.summary
    pathObject[methodName].description = methodProperties.description

    // operationId
    if (!methodProperties.operationId) {
      throw new core.errors.BadData(templates.noPropertyValidationError({
        property: 'operationId',
        method: methodName
      }))
    }
    pathObject[methodName].operationId = methodProperties.operationId

    // tags
    if (!methodProperties.tags || !_.isArray(methodProperties.tags) || !methodProperties.tags.length) {
      throw new core.errors.BadData(templates.noPropertyValidationError({
        property: 'tags',
        method: methodName
      }))
    }
    pathObject[methodName].tags = methodProperties.tags

    pathObject[methodName].security = methodProperties.security

    // add temporarily default schema definition
    pathObject[methodName][CONTENT_SCHEMA_TAG] = methodProperties[CONTENT_SCHEMA_TAG]

    // requestBody
    pathObject[methodName].requestBody = methodProperties.requestBody
    extendOpenApiRequestBody(pathObject[methodName], methodName)

    // parameters
    pathObject[methodName].parameters = methodProperties.parameters

    // responses
    pathObject[methodName].responses = methodProperties.responses
    extendOpenApiResponses(pathObject[methodName], methodName)

    delete pathObject[methodName][CONTENT_SCHEMA_TAG]
  }

  const parameterAlreadyExists = function (parameter, parameters) {
    return _.filter(parameters, (storedParameter) => {
      return storedParameter.in === parameter.in && storedParameter.name === parameter.name
    }).length > 0
  }

  const getPathParameters = function (pathObject) {
    let parameters = []
    _.each(pathObject, (pathProperties) => {
      _.each(pathProperties.parameters, (parameter) => {
        if (parameter.in === 'path' && !parameterAlreadyExists(parameter, parameters)) {
          parameters.push(_.clone(parameter))
        }
      })
    })
    return parameters
  }

  const addOpenApiOptionsMethod = function (pathObject) {
    const tags = _.uniq(_.flatten(_.map(pathObject, (pathProperties) => {
      return pathProperties.tags
    })))
    const pathParameters = getPathParameters(pathObject)

    pathObject.options = {
      security: [],
      tags: tags,
      summary: templates.optionsSummary(),
      description: templates.optionsDescription(),
      responses: {
        '200': {
          '$ref': '#/components/responses/OptionsSuccess'
        },
        '500': {
          '$ref': '#/components/responses/UnexpectedError'
        }
      }
    }

    if (pathParameters.length) {
      pathObject.options.parameters = pathParameters
    }
  }

  const addOpenApiPath = function (pathMethods, pathName, openApi) {
    openApi.paths[pathName] = {}
    _.each(pathMethods, (methodProperties, methodName) => {
      try {
        addOpenApiMethod(methodProperties, methodName, openApi.paths[pathName])
      } catch (err) {
        err.message = templates.addOpenApiMethodError({
          message: err.message,
          pathName: pathName
        })
        throw err
      }
    })
    addOpenApiOptionsMethod(openApi.paths[pathName])
  }

  const expressToOpenApiPath = function (path) {
    const regex = /(\/):(\S*?)(\/|$)/g

    while ((regex.exec(path)) !== null) {
      path = path.replace(regex, '$1{$2}$3')
    }
    return path
  }

  const addOpenApiData = function (openApi, openApiProperties) {
    // Add schemas // TODO, add any type of components
    _.extend(openApi.components.schemas, openApiProperties.schemas)
    // Add tags
    openApi.tags = _.union(openApi.components.tags, openApiProperties.tags)
    // Add paths
    _.each(openApiProperties.paths, (pathMethods, path) => {
      addOpenApiPath(pathMethods, expressToOpenApiPath(path), openApi)
    })

    return Promise.resolve(openApi)
  }

  const getOpenApiDoc = function (routes) {
    if (!openApiDocPromise) {
      openApiDocPromise = Promise.props({
        openApiProperties: api.getOpenApi(),
        configuration: core.config.get()
      }).then((props) => {
        let openapi = JSON.parse(JSON.stringify(openApiBase))
        return Promise.all([
          addOpenApiInfo(openapi, props.configuration),
          addOpenApiData(openapi, props.openApiProperties)
        ]).then(() => {
          return Promise.resolve(openapi)
        })
      })
    }
    return openApiDocPromise
  }

  const addRoutes = function (openApiDoc) {
    const router = express.Router()
    const openApiFile = 'openapi.json'
    const openApiDefinitionUrl = '/api/' + openApiFile

    router.route('/api').get((req, res, next) => {
      res.type('html').render(path.resolve(__dirname, 'views', 'swagger.html'), {
        swaggerUiAssetPath: '/assets/swagger',
        apiDefinitionUrl: '/doc' + openApiDefinitionUrl
      })
    })

    router.route(openApiDefinitionUrl).get((req, res) => {
      res.status(200)
      res.type('json').send(openApiDoc)
    })
    return Promise.resolve(router)
  }

  const initRouter = function () {
    if (!getRouterPromise) {
      return getOpenApiDoc()
        .then(api.setParsedOpenApi)
        .then(addRoutes)
    }
    return getRouterPromise
  }

  return {
    initRouter: initRouter
  }
}

module.exports = Docs
