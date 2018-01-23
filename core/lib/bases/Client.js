'use strict'

const Promise = require('bluebird')
const request = require('request')

const successResponses = [200, 201, 204]
const unAuthenticatedResponses = [401]

const Client = function (core) {
  const Connection = function (hostName, securityOptions) {
    let apiKey = securityOptions && securityOptions.apiKey
    let jwt = {}

    const authenticate = function () {
      console.log('authenticating')
      if (securityOptions && securityOptions.jwt) {
        let requestBody = jwt.refreshToken ? {
          refreshToken: jwt.refreshToken
        } : {
          userName: securityOptions.jwt.userName,
          password: securityOptions.jwt.password
        }
        return new Request('POST', true)('/auth/jwt', requestBody).then((credentials) => {
          jwt.accessToken = credentials.accessToken
          if (credentials.refreshToken) {
            jwt.refreshToken = credentials.refreshToken
          }
          // TODO, log login sucessful, with expiration time
          return Promise.resolve()
        })
      } else {
        return Promise.reject(new core.errors.Unauthorized())
      }
    }

    const Request = function (method, isLogin) {
      return function (url, body) {
        return new Promise((resolve, reject) => {
          let options = {
            method: method,
            url: hostName + '/api' + (url || ''),
            headers: {
              accepts: 'application/json'
            }
          }
          if (body) {
            options.json = true
            options.body = body
          }
          if (apiKey) {
            options.headers['X-Api-Key'] = apiKey
          }
          if (jwt.accessToken) {
            options.headers['authorization'] = 'Bearer ' + jwt.accessToken
          }
          request(options, (error, response, responseBody) => {
            if (error) {
              if (error.code === 'ECONNREFUSED') {
                // TODO, log connection refused
                reject(new core.errors.ServerUnavailable(core.utils.templates.compiled.client.serverUnavailableError({
                  hostName: hostName
                })))
              } else {
                reject(error)
              }
            } else if (unAuthenticatedResponses.indexOf(response.statusCode) > -1) {
              console.log('authentication required')
              if (!isLogin) {
                authenticate()
                  .catch(() => {
                    // TODO, log with request ID, warning error message
                    return Promise.reject(new core.errors.Unauthorized(core.utils.templates.compiled.client.unauthorizedError({
                      hostName: hostName,
                      method: method,
                      url: url
                    })))
                  })
                  .then(() => {
                    return new Request(method)(url, body)
                      .then((result) => {
                        resolve(result)
                      })
                  })
                  .catch((err) => {
                    reject(err)
                  })
              } else {
                reject(new Error(/* TODO, message login failed */))
              }
            } else if (successResponses.indexOf(response.statusCode) < 0) {
              // TODO, log with request ID
              // TODO, map with domapic errors
              reject(new Error('Error ' + response.statusCode))
            } else {
              // TODO, log with request ID
              console.log('RESPONSE!')
              console.log(responseBody)
              console.log('------------')
              resolve(responseBody)
            }
          })
        })
      }
    }

    return {
      get: new Request('GET'),
      post: new Request('POST'),
      put: new Request('PUT'),
      patch: new Request('PATCH'),
      delete: new Request('DELETE'),
      options: new Request('OPTIONS')
    }
  }
  // TODO, services search

  return {
    Connection: Connection
  }
}

module.exports = Client
