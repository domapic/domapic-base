'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const request = require('request')
const uuidv4 = require('uuid/v4')

const successResponses = [200, 201, 204]
const unAuthenticatedResponses = [401]

const Client = function (core) {
  const templates = core.utils.templates.compiled.client

  const Connection = function (hostName, securityOptions) {
    let apiKey = securityOptions && securityOptions.apiKey
    let jwt = {}

    const logRequest = function (request) {
      const logRequest = [templates.sendRequestTitleLog({request: request}), templates.sendRequestInfoLog({request: request})]
      const logBody = _.union(logRequest, request.requestBody ? [templates.requestBodyLog({request: request})] : [])

      return core.tracer.group([{info: logRequest}, {trace: logBody}])
    }

    const logResponse = function (request) {
      const logResponse = [templates.receivedResponseTitleLog({request: request}), templates.receivedResponseInfoLog({request: request})]
      const logBody = _.union(logResponse, request.responseBody ? [templates.responseBodyLog({request: request})] : [])

      return core.tracer.group([{debug: logResponse}, {trace: logBody}])
    }

    const logResponseError = function (request, level) {
      const isControlled = core.errors.isControlled(request.error)
      let traces = []
      let mainTrace = {}
      mainTrace[level || 'error'] = [templates.receivedResponseTitleLog({request: request}), templates.receivedResponseInfoLog({request: request}), templates.requestErrorMessage({error: request.error})]

      traces.push(mainTrace)
      if (!isControlled) {
        traces.push({
          error: [templates.requestErrorTitle(), templates.receivedResponseInfoLog({request: request}), '\n', request.error]
        })
      }

      return core.tracer.group(traces)
    }

    const authenticate = function () {
      if (securityOptions && securityOptions.jwt) {
        let requestBody = jwt.refreshToken ? {
          refreshToken: jwt.refreshToken
        } : {
          userName: securityOptions.jwt.userName,
          password: securityOptions.jwt.password
        }
        return new Request('POST', {
          isLogin: true
        })('/auth/jwt', requestBody).then((credentials) => {
          jwt.accessToken = credentials.accessToken
          if (credentials.refreshToken) {
            jwt.refreshToken = credentials.refreshToken
          }
          return Promise.resolve()
        })
      } else {
        return Promise.reject(new core.errors.Unauthorized())
      }
    }

    const Request = function (method, requestOptions) {
      requestOptions = requestOptions || {}
      let fullUrl, requestId, responseId, statusCode, logOptions

      const doRequest = function (url, body) {
        return new Promise((resolve, reject) => {
          let options = {
            method: method,
            url: fullUrl,
            headers: {
              accepts: 'application/json'
            },
            json: true
          }
          if (body) {
            options.body = body
          }
          if (apiKey) {
            options.headers['X-Api-Key'] = apiKey
          }
          if (jwt.accessToken) {
            options.headers['authorization'] = 'Bearer ' + jwt.accessToken
          }
          request(options, (error, response, responseBody) => {
            let authenticationError = new core.errors.Unauthorized(templates.unauthorizedError({
              hostName: hostName,
              method: method,
              url: url
            }))
            statusCode = response.statusCode
            if (response && response.headers) {
              responseId = response.headers['x-request-id']
            }
            if (error) {
              if (error.code === 'ECONNREFUSED') {
                reject(new core.errors.ServerUnavailable(templates.serverUnavailableError({
                  hostName: hostName
                })))
              } else {
                reject(error)
              }
            } else if (unAuthenticatedResponses.indexOf(response.statusCode) > -1) {
              if (!requestOptions.isLogin) {
                logResponseError(_.extend({}, logOptions, {responseId: responseId, statusCode: statusCode, error: authenticationError}), 'warn')
                authenticate()
                  .catch(() => {
                    return Promise.reject(authenticationError)
                  })
                  .then(() => {
                    return new Request(method, {
                      isPostLogin: true
                    })(url, body)
                      .then((result) => {
                        resolve(result)
                      })
                  })
                  .catch((err) => {
                    reject(err)
                  })
              } else {
                reject(authenticationError)
              }
            } else if (successResponses.indexOf(response.statusCode) < 0) {
              // TODO, log with request ID
              // TODO, map with domapic errors
              reject(new Error('Error ' + response.statusCode))
            } else {
              resolve(responseBody)
            }
          })
        })
      }

      return function (url, body) {
        fullUrl = hostName + '/api' + (url || '')
        requestId = uuidv4()
        logOptions = {
          method: method,
          url: fullUrl,
          requestId: requestId,
          type: requestOptions.isPostLogin ? 'POST-LOGIN ' : requestOptions.isLogin ? 'LOGIN ' : ''
        }
        return logRequest(_.extend({}, logOptions, {requestBody: body})).then(() => {
          return doRequest(url, body)
        }).then((responseBody) => {
          return logResponse(_.extend({}, logOptions, {responseId: responseId, responseBody: responseBody, statusCode: statusCode}))
            .then(() => {
              return Promise.resolve(responseBody)
            })
        }).catch((err) => {
          return logResponseError(_.extend({}, logOptions, {responseId: responseId, statusCode: statusCode, error: err}), 'error')
            .then(() => {
              return Promise.reject(err)
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
