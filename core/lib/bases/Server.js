'use strict'

const http = require('http')
const https = require('https')

const express = require('express')
const Promise = require('bluebird')

const Api = require('./server/Api')
const Middlewares = require('./server/Middlewares')

const Server = function (core) {
  const app = express()
  const middlewares = new Middlewares(core)
  const api = new Api(core, middlewares)

  let started = false
  let startPromise
  let preMiddlewaresPromise

  const addPreMiddlewares = function () {
    if (!preMiddlewaresPromise) {
      preMiddlewaresPromise = middlewares.addPre(app)
    }
    return preMiddlewaresPromise
  }

  const validateOptions = function (options) {
    // TODO, move to templates the logs
    const errorPhrase = 'Invalid server options. '
    if (options.sslKey && !options.sslCert) {
      return Promise.reject(new core.errors.BadData(errorPhrase + 'Provided sslKey, but not sslCert'))
    }
    if (options.sslCert && !options.sslKey) {
      return Promise.reject(new core.errors.BadData(errorPhrase + 'Provided sslCert, but not sslKey'))
    }
    if (!options.port) {
      return Promise.reject(new core.errors.BadData(errorPhrase + 'No port provided'))
    }

    return Promise.resolve(options)
  }

  const startHTTPS = function (options, app) {
    return https.createServer(options, app)
  }

  const startHTTP = function (options, app) {
    return http.createServer(app)
  }

  const startServer = function (options, routers) {
    return new Promise((resolve, reject) => {
      let server
      const serverMethod = options.sslKey ? startHTTPS : startHTTP
      const serverOptions = options.sslKey ? {
        key: options.sslKey,
        cert: options.sslCert
      } : {}

      app.use('/api', routers.api)

      middlewares.addPost(app)
        .catch((error) => {
          reject(error)
        })
        .then(() => {
          server = serverMethod(serverOptions, app)

          server.on('error', (error) => {
            let customError
            switch (error.code) {
              case 'EADDRINUSE':
              // TODO, convert from code
                customError = new core.errors.BadImplementation('Port already in use')
                break
              case 'EACCES':
              // TODO, convert from code
                customError = new core.errors.BadImplementation('Permission denied to use port')
                break
              default:
                customError = error
            }
            reject(customError)
          })

          server.listen({
            port: options.port
          }, (error) => {
            if (error) {
              reject(error)
            } else {
              started = true
              resolve(server)
            }
          })
        })
    })
  }

  const getRouters = function () {
    return Promise.props({
      api: api.getRouter()
    })
  }

  const validateAndStart = function (options) {
    return validateOptions(options)
      .then(getRouters)
      .then((routers) => {
        return startServer(options, routers)
      })
      .then((server) => {
        return core.tracer.group([
          { info: 'Server started' },
          { debug: options }
        ])
      })
  }

  const start = function () {
    if (started) {
      return Promise.reject(new core.errors.Conflict('Server was already started'))
    }
    if (!startPromise) {
      startPromise = core.config.get()
        .then((config) => {
          return validateAndStart({
            sslKey: config.sslKey,
            sslCert: config.sslCert,
            port: config.port
          }, core.errors)
        })
    }
    return startPromise
  }

  const addApiRoutes = function (routes) {
    return addPreMiddlewares()
      .then(() => {
        return api.addRoutes(routes)
      })
  }

  return {
    addApiRoutes: addApiRoutes,
    start: start
  }
}

module.exports = Server
