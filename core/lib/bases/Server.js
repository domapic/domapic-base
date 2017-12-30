'use strict'

const hbs = require('hbs')
const http = require('http')
const https = require('https')
const path = require('path')

const express = require('express')
const Promise = require('bluebird')

const Api = require('./server/Api')
const Middlewares = require('./server/Middlewares')
const serverTemplates = require('../templates/server')

const Server = function (core) {
  const templates = core.utils.templates.compile(serverTemplates)
  const app = express()
  const middlewares = new Middlewares(core)
  const api = new Api(core, middlewares)

  let started = false
  let startPromise
  let preMiddlewaresPromise

  app.set('view engine', 'html')
  app.engine('html', hbs.__express)

  const addPreMiddlewares = function () {
    if (!preMiddlewaresPromise) {
      preMiddlewaresPromise = middlewares.addPre(app)
    }
    return preMiddlewaresPromise
  }

  const validateOptions = function (options) {
    if (options.sslKey && !options.sslCert) {
      return Promise.reject(new core.errors.BadData(templates.invalidOptionsError({message: templates.noSslCertError()})))
    }
    if (options.sslCert && !options.sslKey) {
      return Promise.reject(new core.errors.BadData(templates.invalidOptionsError({message: templates.noSslKeyError()})))
    }
    if (!options.port) {
      return Promise.reject(new core.errors.BadData(templates.invalidOptionsError({message: templates.noPortError()})))
    }

    return Promise.resolve(options)
  }

  const startHTTPS = function (options, app) {
    return https.createServer(options, app)
  }

  const startHTTP = function (options, app) {
    return http.createServer(app)
  }

  const registerViewPartials = function (partialsPath) {
    return new Promise((resolve, reject) => {
      hbs.registerPartials(partialsPath, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  const registerBaseViewPartials = function () {
    return registerViewPartials(path.resolve(__dirname, '..', 'views', 'partials'))
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
                customError = new core.errors.BadImplementation(templates.portInUseError({
                  port: options.port
                }))
                break
              case 'EACCES':
              // TODO, convert from code
                customError = new core.errors.BadImplementation(templates.portDeniedError({
                  port: options.port
                }))
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
      api: api.initRouter()
    })
  }

  const validateAndStart = function (options) {
    return validateOptions(options)
      .then(getRouters)
      .then((routers) => {
        return registerBaseViewPartials()
          .then(() => {
            return startServer(options, routers)
          })
      })
      .then((server) => {
        return core.tracer.group([
          { info: templates.serverStarted({port: options.port}) },
          { debug: [templates.serverOptionsLogTitle(), options] }
        ])
      })
  }

  const start = function () {
    if (started) {
      return Promise.reject(new core.errors.Conflict(templates.serverStartedError()))
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
