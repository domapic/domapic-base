'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const randToken = require('rand-token')

const bases = require('./bases')
const serviceArguments = require('./arguments/service')

const IdOperations = require('./api/id/Operations')
const idOpenApi = require('./api/id/openapi.json')

// TODO, jwt login methods. To be implemented in Controller. Here only for testing purposes temporarily

const createRefreshToken = function () {
  return Promise.resolve(randToken.generate(16))
}

const FOO_USERS = [
  {
    userName: 'manolo',
    password: 'testing'
  }
]

const refreshTokens = []

const findUserByData = function (userData) {
  return Promise.resolve(_.find(FOO_USERS, (registeredUser) => {
    return registeredUser.userName === userData.userName && registeredUser.password === userData.password
  }))
}

const addRefreshToken = function (userName) {
  return createRefreshToken()
    .then((refreshToken) => {
      refreshTokens.push({
        userName: userName,
        token: refreshToken
      })
      return Promise.resolve(refreshToken)
    })
}

const findRefreshTokenUser = function (refreshToken) {
  return Promise.resolve(_.find(refreshTokens, (savedRefreshToken) => {
    return savedRefreshToken.token === refreshToken && _.find(FOO_USERS, (registeredUser) => {
      return savedRefreshToken.userName === registeredUser.userName
    })
  }))
}

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
              console.log('Verify if an user can receive a json web token')
              console.log(userData)
              console.log('existant refresh tokens')
              console.log(refreshTokens)

              if (userData.refresh_token) {
                return findRefreshTokenUser(userData.refresh_token)
                  .then((user) => {
                    if (user) {
                      return Promise.resolve({
                        userData: {
                          userName: user.userName
                        }
                      })
                    } else {
                      return Promise.reject(new core.errors.Forbidden())
                    }
                  })
              } else {
                return findUserByData(userData)
                  .then((user) => {
                    if (user) {
                      return Promise.resolve(user)
                    }
                    return Promise.reject(new core.errors.Forbidden())
                  })
                  .then((user) => {
                    return addRefreshToken(user.userName)
                      .then((refreshToken) => {
                        return Promise.resolve({
                          userData: {
                            userName: user.userName
                          },
                          refresh_token: refreshToken
                        })
                      })
                  })
              }
            },
            reject: (refreshToken) => {
              // Delete available refresh tokens
              return Promise.resolve()
            }
          },
          apiKey: {
            authenticate: (userData) => {
              console.log('Creates a new api key')
              console.log(userData)
              return Promise.reject(new core.errors.Forbidden())
            },
            reject: (apiKey) => {
              // Delete available api Key
              return Promise.resolve()
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
