'use strict'

const hbs = require('hbs')
const http = require('http')
const https = require('https')
const path = require('path')

const express = require('express')
const Promise = require('bluebird')

const Api = require('./server/Api')
const Doc = require('./server/Doc')
const Middlewares = require('./server/Middlewares')
const serverTemplates = require('../templates/server')
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()

const Server = function (options, core) {
  const templates = core.utils.templates.compile(serverTemplates)
  const app = express()
  const middlewares = new Middlewares(options, core)
  const api = new Api(options, core, middlewares)
  const doc = new Doc(options, core, middlewares, api)

  let started = false
  let startPromise
  let preMiddlewaresPromise

  app.disable('etag')
  app.set('view engine', 'html')
  app.engine('html', hbs.__express)

  const addPreMiddlewares = function () {
    if (!preMiddlewaresPromise) {
      app.use('/assets/swagger', middlewares.lowerRequestLogLevel)
      preMiddlewaresPromise = middlewares.addPre(app)
    }
    return preMiddlewaresPromise
  }

  const validateOptions = function (startOptions) {
    if (startOptions.sslKey && !startOptions.sslCert) {
      return Promise.reject(new core.errors.BadData(templates.invalidOptionsError({message: templates.noSslCertError()})))
    }
    if (startOptions.sslCert && !startOptions.sslKey) {
      return Promise.reject(new core.errors.BadData(templates.invalidOptionsError({message: templates.noSslKeyError()})))
    }
    if (!startOptions.port) {
      return Promise.reject(new core.errors.BadData(templates.invalidOptionsError({message: templates.noPortError()})))
    }

    return Promise.resolve(startOptions)
  }

  const startHTTPS = function (nodeServerOptions, app) {
    return https.createServer(nodeServerOptions, app)
  }

  const startHTTP = function (nodeServerOptions, app) {
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
    return registerViewPartials(path.resolve(__dirname, 'server', 'views', 'partials'))
  }

  const startServer = function (startOptions, routers) {
    return new Promise((resolve, reject) => {
      let server
      const serverMethod = startOptions.sslKey ? startHTTPS : startHTTP
      const nodeServerOptions = startOptions.sslKey ? {
        key: startOptions.sslKey,
        cert: startOptions.sslCert
      } : {}

      app.use('/assets', express.static(path.resolve(__dirname, 'server', 'assets')))
      app.use('/assets/swagger', express.static(swaggerUiAssetPath))
      app.use('/doc', routers.doc)
      app.use('/api', routers.api)

      // temporarily redirect index to api docs
      app.get('/', (req, res) => {
        res.redirect('/doc/api')
      })

      middlewares.addPost(app)
        .catch((error) => {
          reject(error)
        })
        .then(() => {
          server = serverMethod(nodeServerOptions, app)

          server.on('error', (error) => {
            let customError
            switch (error.code) {
              case 'EADDRINUSE':
                customError = new core.errors.BadImplementation(templates.portInUseError({
                  port: startOptions.port
                }))
                break
              case 'EACCES':
                customError = new core.errors.BadImplementation(templates.portDeniedError({
                  port: startOptions.port
                }))
                break
              default:
                customError = error
            }
            reject(customError)
          })

          server.listen({
            port: startOptions.port
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
      api: api.initRouter(),
      doc: doc.initRouter()
    })
  }

  const validateAndStart = function (startOptions) {
    return validateOptions(startOptions)
      .then(getRouters)
      .then((routers) => {
        return registerBaseViewPartials()
          .then(() => {
            return startServer(startOptions, routers)
          })
      })
      .then((server) => {
        return core.tracer.group([
          { info: templates.serverStarted({port: startOptions.port}) },
          { debug: [templates.serverOptionsLogTitle(), startOptions] }
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
          })
        })
    }
    return startPromise
  }

  const addApi = function (openApiDefinitions) {
    return addPreMiddlewares()
      .then(() => {
        return api.addApi(openApiDefinitions)
      })
  }

  return {
    addApi: addApi,
    start: start
  }
}

module.exports = Server
