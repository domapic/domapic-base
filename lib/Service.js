'use strict'

const Promise = require('bluebird')

const bases = require('./bases')
const serviceArguments = require('./arguments/service')

const InfoOperations = require('./api/info/Operations')
const infoOpenApi = require('./api/info/openapi.json')

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
        server.extendOpenApi(infoOpenApi),
        server.addOperations(new InfoOperations(core))
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
