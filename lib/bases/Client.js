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
    let loginPromise
    let makingLogin
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
      } else {
        traces.push({
          trace: [templates.requestErrorTitle(), templates.receivedResponseInfoLog({request: request}), '\n', request.error.extraData]
        })
      }

      return core.tracer.group(traces)
    }

    const getLoginCredentials = function () {
      return jwt.refreshToken ? {
        refreshToken: jwt.refreshToken
      } : {
        userName: securityOptions.jwt.userName,
        password: securityOptions.jwt.password
      }
    }

    const setLoginCredentials = function (credentials) {
      jwt.accessToken = credentials.accessToken
      if (credentials.refreshToken) {
        jwt.refreshToken = credentials.refreshToken
      }
    }

    const deleteLoginRefreshToken = function () {
      if (jwt.refreshToken) {
        delete jwt.refreshToken
      }
    }

    const authenticate = function () {
      if (securityOptions && securityOptions.jwt) {
        if (!makingLogin) {
          makingLogin = true
          loginPromise = new Request('POST', {
            isLogin: true
          })('/auth/jwt', getLoginCredentials())
          .catch((err) => {
            makingLogin = false
            if (jwt.refreshToken) {
              // Retry without refresh token
              deleteLoginRefreshToken()
              return authenticate()
            } else {
              return Promise.reject(err)
            }
          }).then((credentials) => {
            makingLogin = false
            setLoginCredentials(credentials)
            return Promise.resolve(credentials)
          })
        }
        return loginPromise
      } else {
        return Promise.reject(new core.errors.Unauthorized())
      }
    }

    const Request = function (method, requestOptions) {
      requestOptions = requestOptions || {}
      let fullUrl, requestId, responseId, statusCode, logOptions

      const setRequestData = function (url, body) {
        fullUrl = hostName + '/api' + (url || '')
        requestId = uuidv4()
        logOptions = {
          method: method,
          url: fullUrl,
          requestId: requestId,
          type: requestOptions.isPostLogin ? 'POST-LOGIN ' : requestOptions.isLogin ? 'LOGIN ' : ''
        }
      }

      const setResponseData = function (response) {
        if (response) {
          statusCode = response.statusCode
          responseId = response.headers && response.headers['x-request-id']
        }
      }

      const authenticationError = function () {
        return new core.errors.Unauthorized(templates.unauthorizedError({
          hostName: hostName,
          method: method,
          url: fullUrl
        }))
      }

      const doRequest = function (url, body) {
        const getOptions = function () {
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
          return options
        }

        return new Promise((resolve, reject) => {
          request(getOptions(), (error, response, responseBody) => {
            setResponseData(response)
            if (error) {
              if (error.code === 'ECONNREFUSED') {
                reject(new core.errors.ServerUnavailable(templates.serverUnavailableError({
                  hostName: hostName
                })))
              } else {
                reject(error)
              }
            } else if (unAuthenticatedResponses.indexOf(statusCode) > -1) {
              if (!requestOptions.isLogin) {
                logResponseError(_.extend({}, logOptions, {responseId: responseId, statusCode: statusCode, error: authenticationError()}), 'warn')
                authenticate()
                  .catch(() => {
                    return Promise.reject(authenticationError())
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
            } else if (successResponses.indexOf(statusCode) < 0) {
              reject(new core.errors.FromCode(statusCode, templates.receivedErrorStatus({
                statusCode: statusCode
              }), null, responseBody))
            } else {
              resolve(responseBody)
            }
          })
        })
      }

      return function (url, body) {
        setRequestData(url, body)
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
