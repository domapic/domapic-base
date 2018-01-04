'use strict'

const path = require('path')

const _ = require('lodash')
const express = require('express')
const Promise = require('bluebird')

const openapiBase = require('./openapi')
const openApiTemplates = require('../../templates/openapi')

const APP_JSON = 'application/json'

const Docs = function (core, middlewares, api) {
  const templates = core.utils.templates.compile(openApiTemplates)
  let getRouterPromise
  let openApiDocPromise

  const addOpenApiInfo = function (openapi, configuration) {
    openapi.info.description = 'Domapic service' // TODO, read from package.json
    openapi.info.version = '1.0.0' // TODO, read from package.json
    openapi.info.title = templates.title({name: configuration.name})
    openapi.host = templates.host({host: 'localhost', port: configuration.port}) // TODO, get from config
    openapi.schemes.push(configuration.sslKey ? 'https' : 'http')
    return Promise.resolve(openapi)
  }

  const hasBodyParams = function (parameters) {
    return _.filter(parameters, (parameter) => {
      return parameter.in === 'body'
    }).length > 0
  }

  const AddOpenApiToMethods = function (sharedInfo, responsesDefinitions, path) {
    return function (methodProperties, method) {
      const defaultsResponsesCodes = _.isArray(responsesDefinitions[method].statusCode) ? responsesDefinitions[method].statusCode : [responsesDefinitions[method].statusCode]
      const defaultsHasBody = _.isArray(responsesDefinitions[method].responseBody) ? responsesDefinitions[method].responseBody : [responsesDefinitions[method].responseBody]
      const defaultsResponsesHeaders = responsesDefinitions[method].responseHeaders && _.isArray(responsesDefinitions[method].responseHeaders[0]) ? responsesDefinitions[method].responseHeaders : [responsesDefinitions[method].responseHeaders]

      sharedInfo.pathTags = _.union(sharedInfo.pathTags, methodProperties.tags || [])
      if (!methodProperties.parameters) {
        methodProperties.parameters = []
      }

      if (methodProperties.parameters.length && hasBodyParams(methodProperties.parameters) && (!methodProperties.consumes || methodProperties.consumes.indexOf(APP_JSON) < 0)) {
        methodProperties.consumes = methodProperties.consumes || []
        methodProperties.consumes.push(APP_JSON)
      }

      // Sucessful responses
      methodProperties.responses = methodProperties.responses || {}

      _.each(defaultsResponsesCodes, (defaultResponseCode, index) => {
        // Add produces
        if (defaultsHasBody[index] && (!methodProperties.produces || methodProperties.produces.indexOf(APP_JSON) < 0)) {
          methodProperties.produces = methodProperties.produces || []
          methodProperties.produces.push(APP_JSON)
        }

        // Add responses
        methodProperties.responses[defaultResponseCode] = methodProperties.responses[defaultResponseCode] || {}
        if (!methodProperties.responses[defaultResponseCode].description) {
          methodProperties.responses[defaultResponseCode].description = templates.sucessfulOperation()
        }

        // Add headers
        if (defaultsResponsesHeaders[index]) {
          _.each(defaultsResponsesHeaders[index], (header) => {
            if (!methodProperties.responses[defaultResponseCode].headers || !methodProperties.responses[defaultResponseCode].headers[header]) {
              // TODO, to full schema. It seema like validator does not like the header 'ref' (or put data directly)
              methodProperties.responses[defaultResponseCode].headers = methodProperties.responses[defaultResponseCode].headers || {}
              methodProperties.responses[defaultResponseCode].headers[header.toLowerCase()] = {
                '$ref': '#/components/headers/' + header.replace(/-/g, '')
              }
            }
          })
        }

        // Add default definition
        if (defaultsHasBody[index] && !methodProperties.responses[defaultResponseCode].schema) {
          methodProperties.responses[defaultResponseCode].schema = {
            '$ref': '#/definitions/' + _.capitalize(path.replace('/', ''))
          }
        }
      })

      // Error responses
      if (methodProperties.parameters.length && !methodProperties.responses['422']) {
        methodProperties.responses['422'] = {
          '$ref': '#/components/responses/BadDataError'
        }
      }
    }
  }

  const addOpenApiOptionsMethod = function (pathMethods, sharedInfo) {
    pathMethods['options'] = pathMethods['options'] || {
      tags: _.uniq(sharedInfo.pathTags),
      summary: 'Identify allowed request methods', // TODO, templates
      description: 'Find out which request methods supports', // TODO, templates
      responses: {
        '200': {
          '$ref': '#/components/responses/Options'
        }
      }
    }
  }

  const addOpenApiData = function (openapi, openApiProperties, responsesDefinitions) {
    const extendedDefinitions = _.extend(openapi.definitions, openApiProperties.definitions || {})
    _.extend(openapi, openApiProperties)
    openapi.definitions = extendedDefinitions

    _.each(openapi.paths, (pathMethods, path) => {
      let sharedInfo = {
        paths: []
      }
      _.each(pathMethods, new AddOpenApiToMethods(sharedInfo, responsesDefinitions, path))
      addOpenApiOptionsMethod(pathMethods, sharedInfo)
    })
    return Promise.resolve(openapi)
  }

  const getOpenApiDoc = function (routes) {
    if (!openApiDocPromise) {
      openApiDocPromise = Promise.props({
        openApiProperties: api.getOpenApi(),
        configuration: core.config.get(),
        responsesDefinitions: api.getResponsesDefinitions()
      }).then((props) => {
        let openapi = JSON.parse(JSON.stringify(openapiBase))
        return Promise.all([
          addOpenApiInfo(openapi, props.configuration),
          addOpenApiData(openapi, props.openApiProperties, props.responsesDefinitions)
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
      res.type('html').render(path.resolve(__dirname, '..', '..', 'views', 'swagger.html'), {
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
