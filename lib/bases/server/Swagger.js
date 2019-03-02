'use strict'

const path = require('path')

const express = require('express')
const Promise = require('bluebird')

const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()

const Swagger = function (middlewares) {
  const initRouter = function () {
    const router = express.Router()

    router.use('/assets', express.static(swaggerUiAssetPath))

    router.use(middlewares.staticPolicies)
    router.use(middlewares.lowerRequestLogLevel)

    router.route('/').get((req, res, next) => {
      res.type('html').render(path.resolve(__dirname, 'views', 'swagger.hbs'), {
        swaggerUiAssetPath: '/swagger/assets',
        apiDefinitionUrl: '/api/openapi.json'
      })
    })

    return Promise.resolve(router)
  }

  return {
    initRouter: initRouter
  }
}

module.exports = Swagger
