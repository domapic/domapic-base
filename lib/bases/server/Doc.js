'use strict'

const path = require('path')

const express = require('express')
const Promise = require('bluebird')

const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()

const Doc = function () {
  const initRouter = function () {
    const router = express.Router()

    router.use('/assets/swagger', express.static(swaggerUiAssetPath))

    router.route('/api').get((req, res, next) => {
      res.type('html').render(path.resolve(__dirname, 'views', 'swagger.hbs'), {
        swaggerUiAssetPath: '/doc/assets/swagger',
        apiDefinitionUrl: '/api/openapi.json'
      })
    })

    return Promise.resolve(router)
  }

  return {
    initRouter: initRouter
  }
}

module.exports = Doc
