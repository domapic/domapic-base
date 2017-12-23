'use strict'

const Promise = require('bluebird')

const bases = require('./bases')

const serviceArguments = require('./arguments/service')

const Service = function () {
  // TODO, remove promise from constructor. Now it is useful only for error handling, implement it later, in upper layer

  return new bases.Arguments(serviceArguments).get()
    .then((args) => {
      const core = new bases.Core(args, 'service')
      const server = new bases.Server(core)
      const client = new bases.Client(core)

      return Promise.resolve({
        tracer: core.tracer,
        server: server,
        client: client
      })
    })
}

module.exports = Service
