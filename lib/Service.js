'use strict'

const Promise = require('bluebird')

const bases = require('./bases')
const serviceArguments = require('./arguments/service')

const AboutOperations = require('./api/about/Operations')
const aboutOpenApi = require('./api/about/openapi.json')
const ConfigOperations = require('./api/config/Operations')
const configOpenApi = require('./api/config/openapi.json')

const Service = function (options) {
  return new bases.Arguments(serviceArguments).get()
    .then((args) => {
      const core = new bases.Core(args, 'service', options && options.packagePath)
      const server = new bases.Server(core)
      const client = new bases.Client(core)

      const logCreated = function () {
        return core.config.get()
          .then((configuration) => {
            return core.tracer.debug(core.utils.templates.compiled.service.serviceCreated({
              config: configuration
            }))
          })
      }

      return Promise.all([
        server.extendOpenApi(aboutOpenApi),
        server.addOperations(new AboutOperations(core)),
        server.extendOpenApi(configOpenApi),
        server.addOperations(new ConfigOperations(core))
      ]).then(() => {
        return logCreated()
          .then(() => {
            return Promise.resolve({
              tracer: core.tracer,
              server: server,
              client: client
            })
          })
      })
    })
}

module.exports = Service
