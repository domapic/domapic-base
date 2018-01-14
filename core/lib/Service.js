'use strict'

const Promise = require('bluebird')

const bases = require('./bases')
const serviceArguments = require('./arguments/service')

const IdOperations = require('./api/id/Operations')
const idOpenApi = require('./api/id/openapi.json')

// TODO, remove promise from constructor. Now it is useful only for error handling, implement it later, in upper layer
const Service = function () {
  return new bases.Arguments(serviceArguments).get()
    .then((args) => {
      const core = new bases.Core(args, 'service')
      const server = new bases.Server(core)
      const client = new bases.Client(core)

      return Promise.all([
        server.addAuthentication({
          jwt: {
            authenticate: (userData) => {
              // UserData can be data, or refresh token. If token, only check if exists, and return it
              console.log('Trying to log in with JWT')
              console.log(userData)
              return Promise.reject(new core.errors.Forbidden())
            },
            reject: (refreshToken) => {
              // Delete available refresh tokens
              return Promise.resolve()
            }
          },
          apiKey: {
            authenticate: (userData) => {
              console.log('Trying to log in with api key')
              console.log(userData)
              return Promise.reject(new core.errors.Forbidden())
            },
            reject: (apiKey) => {
              // Delete available api Key
            }
          }
        }),
        server.extendOpenApi(idOpenApi),
        server.addOperations(new IdOperations(core))
      ]).then(() => {
        return Promise.resolve({
          tracer: core.tracer,
          server: server,
          client: client
        })
      })
    })
}

module.exports = Service
