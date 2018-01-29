'use strict'

const hbs = require('hbs')
const http = require('http')
const https = require('https')
const path = require('path')
const fs = require('fs')

const express = require('express')
const Promise = require('bluebird')

const Api = require('./server/api/Api')
const SecurityMethods = require('./server/security')
const Doc = require('./server/Doc')
const Middlewares = require('./server/Middlewares')

const Server = function (core) {
  const app = express()
  const templates = core.utils.templates.compiled.server
  const middlewares = new Middlewares(core)
  const securityMethods = new SecurityMethods(core)
  const api = new Api(core, middlewares, securityMethods)
  const doc = new Doc()

  let started = false
  let startPromise

  app.disable('etag')
  app.set('view engine', hbs)

  app.use('/assets', middlewares.lowerRequestLogLevel)
  app.use('/assets', express.static(path.resolve(__dirname, 'server', 'assets')))

  app.use(middlewares.addRequestId)
  app.use(middlewares.jsonBodyParser)
  app.use(middlewares.urlEncoded)
  app.use(middlewares.logRequest)

  const StartServerErrorHandler = function (startOptions, reject) {
    return function (error) {
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
    }
  }

  const ServerStarted = function (resolve, reject, server) {
    return function (error) {
      if (error) {
        reject(error)
      } else {
        started = true
        resolve(server)
      }
    }
  }

  const registerViewPartials = function (partialsPath) {
    return new Promise((resolve, reject) => {
      hbs.registerPartials(path.resolve(__dirname, 'server', 'views', 'partials'), (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
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

  const startServer = function (startOptions, routers) {
    return new Promise((resolve, reject) => {
      let server
      const serverMethod = startOptions.sslKey ? startHTTPS : startHTTP
      const nodeServerOptions = startOptions.sslKey ? {
        key: fs.readFileSync(startOptions.sslKey),
        cert: fs.readFileSync(startOptions.sslCert)
      } : {}

      app.use(new middlewares.DomapicHeaders({
        name: startOptions.name,
        serviceType: core.info.type
      }))
      app.use('/doc', routers.doc)
      app.use('/api', routers.api)

      // temporarily redirect index to api docs
      app.get('/', (req, res) => {
        res.redirect('/doc/api')
      })

      app.use(middlewares.notFound)
      app.use(middlewares.errorTrace)
      app.use(middlewares.errorHandler)

      server = serverMethod(nodeServerOptions, app)

      server.on('error', new StartServerErrorHandler(startOptions, reject))

      server.listen({
        port: startOptions.port,
        host: startOptions.hostName
      }, new ServerStarted(resolve, reject, server))
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
      .then(registerViewPartials)
      .then(getRouters)
      .then((routers) => {
        return startServer(startOptions, routers)
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
            hostName: config.hostName,
            port: config.port,
            name: config.name
          })
        })
    }
    return startPromise
  }

  return {
    extendOpenApi: api.extendOpenApi,
    addOperations: api.addOperations,
    addAuthentication: api.addAuthentication,
    start: start
  }
}

module.exports = Server
