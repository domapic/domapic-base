'use strict'

const hbs = require('hbs')
const http = require('http')
const https = require('https')
const path = require('path')
const fs = require('fs')
const compression = require('compression')

const express = require('express')
const Promise = require('bluebird')

const Api = require('./server/api/Api')
const SecurityMethods = require('./server/security')
const Swagger = require('./server/Swagger')
const Middlewares = require('./server/Middlewares')

const Server = function (core) {
  const app = express()
  const templates = core.utils.templates.compiled.server
  const middlewares = new Middlewares(core)
  const securityMethods = new SecurityMethods(core)
  const api = new Api(core, middlewares, securityMethods)
  const swagger = new Swagger(middlewares)

  let started = false
  let startPromise
  let initPromise
  let statics = []

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
    return Promise.resolve(https.createServer(nodeServerOptions, app))
  }

  const startHTTP = function (nodeServerOptions, app) {
    return core.tracer.warn(templates.noSslWarning())
      .then(() => {
        return Promise.resolve(http.createServer(app))
      })
  }

  const initServer = function (startOptions, routers) {
    const serverMethod = startOptions.sslKey ? startHTTPS : startHTTP
    const nodeServerOptions = startOptions.sslKey ? {
      key: fs.readFileSync(startOptions.sslKey),
      cert: fs.readFileSync(startOptions.sslCert)
    } : {}

    app.disable('etag')
    app.set('view engine', hbs)

    app.use(middlewares.addRequestId)
    app.use(middlewares.jsonBodyParser)
    app.use(middlewares.urlEncoded)
    app.use(middlewares.logRequest)
    app.use(middlewares.helmet)
    app.use(middlewares.cors)

    app.use('/swagger', routers.swagger)
    app.use('/swagger/*', middlewares.notFound)
    app.use('/api', routers.api)
    app.use('/api/*', middlewares.notFound)

    if (!statics.length) {
      app.use('/assets', middlewares.staticPolicies)
      app.use('/assets', middlewares.lowerRequestLogLevel)
      app.use('/assets', compression())
      app.use('/assets', express.static(path.resolve(__dirname, 'server', 'assets')))
      app.get('/', (req, res) => {
        res.redirect('/swagger')
      })
    }
    statics.forEach(staticResource => {
      app.use(staticResource.serverPath, middlewares.staticPolicies)
      app.use(staticResource.serverPath, middlewares.lowerRequestLogLevel)
      app.use(staticResource.serverPath, compression())
      app.use(staticResource.serverPath, express.static(staticResource.staticsPath, {
        maxAge: 31536000
      }))
    })

    app.use(middlewares.errorTrace)
    app.use(middlewares.errorHandler)

    return serverMethod(nodeServerOptions, app)
  }

  const startServer = function (server, startOptions) {
    return new Promise((resolve, reject) => {
      const serverOptions = {
        port: startOptions.port
      }
      if (startOptions.hostName && startOptions.hostName.length > 0) {
        serverOptions.host = startOptions.hostName
      }
      server.on('error', new StartServerErrorHandler(startOptions, reject))

      server.listen(serverOptions, new ServerStarted(resolve, reject, server))
    })
  }

  const getRouters = function () {
    return Promise.props({
      api: api.initRouter(),
      swagger: swagger.initRouter()
    })
  }

  const initAndGetOptions = function () {
    if (!initPromise) {
      initPromise = core.config.get()
        .then(config => {
          const startOptions = {
            sslKey: config.sslKey,
            sslCert: config.sslCert,
            hostName: config.hostName,
            port: config.port,
            name: config.name
          }
          return validateOptions(startOptions)
            .then(registerViewPartials)
            .then(getRouters)
            .then(routers => {
              return initServer(startOptions, routers)
                .then(server => {
                  return Promise.resolve({
                    options: startOptions,
                    server: server
                  })
                })
            })
        })
    }
    return initPromise
  }

  const init = () => {
    return initAndGetOptions()
      .then(serverAndOptions => {
        return Promise.resolve(serverAndOptions.server)
      })
  }

  const start = function () {
    if (started) {
      return Promise.reject(new core.errors.Conflict(templates.serverStartedError()))
    }
    if (!startPromise) {
      startPromise = initAndGetOptions()
        .then((serverAndOptions) => {
          return startServer(serverAndOptions.server, serverAndOptions.options)
            .then(() => {
              return core.tracer.group([
                { info: templates.serverStarted({port: serverAndOptions.options.port}) },
                { trace: [templates.serverOptionsLogTitle(), serverAndOptions.options] }
              ])
            })
        })
        .catch((err) => {
          if (core.errors.isControlled(err)) {
            return core.tracer.error(err.message)
          }
          return Promise.reject(err)
        })
    }
    return startPromise
  }

  const addStatic = (serverPath, staticsPath, notFound) => {
    statics.push({
      serverPath,
      staticsPath,
      notFound
    })
  }

  return {
    extendOpenApi: api.extendOpenApi,
    addOperations: api.addOperations,
    addMiddleware: api.addMiddleware,
    addAuthentication: api.addAuthentication,
    addAuthorization: api.addAuthorization,
    addStatic: addStatic,
    init: init,
    start: start
  }
}

module.exports = Server
