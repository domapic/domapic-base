'use strict'

const Promise = require('bluebird')

const bases = require('./bases')
const serviceArguments = require('./arguments/service')

const IdOperations = require('./api/id/Operations')
const idOpenApi = require('./api/id/openapi.json')

const Service = function (type) {
  return new bases.Arguments(serviceArguments).get()
    .then((args) => {
      const core = new bases.Core(args, 'service')
      const server = new bases.Server(core, type)
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
        server.extendOpenApi(idOpenApi),
        server.addOperations(new IdOperations(core))
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
