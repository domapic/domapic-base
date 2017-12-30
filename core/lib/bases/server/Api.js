'use strict'

const path = require('path')

const _ = require('lodash')
const express = require('express')
const isPromise = require('is-promise')
const jsonschema = require('jsonschema')
const Promise = require('bluebird')

const serverTemplates = require('../../templates/server')

const Api = function (core, middlewares) {
  const templates = core.utils.templates.compile(serverTemplates)
  const router = express.Router()
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
      statusCode: 204,
      responseBody: false
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
  let getRouterPromise

  const getValidationMessage = function (validation) {
    return _.map(validation.errors, (error) => {
      return templates.bodyPropertiesValidationError({
        property: error.property,
        message: error.message
      })
    }).join('. ')
  }

  const SendResponse = function (methodToUse) {
    const sendResponse = function (req, res, response) {
      res.status(methods[methodToUse].statusCode)
      if (methods[methodToUse].responseBody) {
        middlewares.sendResponse(req, res, response, path.resolve(__dirname, '..', '..', 'views', 'api.html'))
      } else {
        middlewares.sendResponse(req, res)
      }
    }
    return sendResponse
  }

  const addRoute = function (route) {
    const methodToUse = route.method.toLowerCase()
    const sendResponse = new SendResponse(methodToUse)

    if (!methods[methodToUse]) {
      return Promise.reject(new core.errors.MethodNotAllowed(templates.methodNotAllowedError({
        method: methodToUse
      })))
    }

    routes[route.route] = routes[route.route] || {}
    routes[route.route][methodToUse] = route.body || {}

    router.route(route.route)[methodToUse](/* TODO, add authorization handler */ (req, res, next) => {
      let response
      const validation = (route.body && jsonschema.validate(req.body, route.body)) || {}

      if (validation.errors && validation.errors.length) {
        next(new core.errors.BadData(getValidationMessage(validation)))
      } else {
        response = route.handler({
          params: req.params,
          body: req.body
        })
        if (isPromise(response)) {
          response.catch((err) => {
            next(err)
          }).then((result) => {
            sendResponse(req, res, result)
          })
        } else {
          sendResponse(req, res, response)
        }
      }
    })

    return Promise.resolve()
  }

  const addRoutes = function (routesToAdd) {
    if (getRouterPromise) {
      return Promise.reject(new core.errors.Conflict(templates.routerAlreadyInitializedError()))
    }
    routesToAdd = _.isArray(routesToAdd) ? routesToAdd : [routesToAdd]
    return Promise.map(routesToAdd, addRoute)
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
    initRouter: initRouter,
    addRoutes: addRoutes
  }
}

module.exports = Api
