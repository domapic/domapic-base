'use strict'

const Promise = require('bluebird')

const bases = require('./bases')
const serviceArguments = require('./arguments/service')

const idRoute = require('./routes/api/id')

const Service = function () {
  // TODO, remove promise from constructor. Now it is useful only for error handling, implement it later, in upper layer
  // TODO, receive options with authentication and authorization
  // TODO, add not authorized (or not authenticated) response
  // TODO, add login method
  // TODO, add warning when start non-secured server with api-key, or jwt

  return new bases.Arguments(serviceArguments).get()
    .then((args) => {
      const core = new bases.Core(args, 'service')
      const server = new bases.Server({
        authenticationMethod: 'jwt',
        authentication: (credentials, refreshToken) => {
          console.log('credentials')
          console.log(credentials)
          console.log('refreshToken')
          console.log(refreshToken)
          return Promise.reject(new Error('Invalid credentials'))
        }
      }, core)
      const client = new bases.Client(core)

      return server.addApi(idRoute)
      .then(() => {
        return Promise.resolve({
          tracer: core.tracer,
          server: server,
          client: client
        })
      })
    })
}

module.exports = Service
