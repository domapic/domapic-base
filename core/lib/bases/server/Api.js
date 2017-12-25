'use strict'

const _ = require('lodash')

const express = require('express')
const isPromise = require('is-promise')
const jsonschema = require('jsonschema')
const Promise = require('bluebird')

const Api = function (core, middlewares) {
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
    }
  }
  let routes = []

  const getValidationMessage = function (validation) {
    return _.map(validation.errors, (error) => {
      return error.property + ': ' + error.message
    }).join('. ')
  }

  const addRoute = function (route) {
    const methodToUse = route.method.toLowerCase()
    const sendResponse = function (req, res, response) {
      res.status(methods[methodToUse].statusCode)
      if (methods[methodToUse].responseBody) {
        middlewares.sendResponse(req, res, response, 'templateName')
      } else {
        res.send()
      }
    }
    if (!methods[methodToUse]) {
      return Promise.reject(new core.errors.MethodNotAllowed('Wrong method "' + methodToUse + '"'))
    }
    routes.push(route.route)
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
          response.then((result) => {
            sendResponse(req, res, result)
          }).catch((err) => {
            next(err)
          })
        } else {
          sendResponse(req, res, response)
        }
      }
    })

    return Promise.resolve()
  }

  const addRoutes = function (routes) {
    routes = _.isArray(routes) ? routes : [routes]
    return Promise.map(routes, addRoute)
  }

  const addMethodNotAllowed = function () {
    return Promise.map(routes, (route) => {
      return middlewares.addMethodNotAllowed(router.route(route))
    })
  }

  const getRouter = function () {
    return addMethodNotAllowed()
      .then(() => {
        return Promise.resolve(router)
      })
  }

  return {
    getRouter: getRouter,
    addRoutes: addRoutes
  }
}

module.exports = Api
