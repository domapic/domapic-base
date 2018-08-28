'use strict'

const Promise = require('bluebird')

const openApi = require('./openapi.json')

const SecurityModule = function (core) {
  const templates = core.utils.templates.compiled.server
  let authenticateAuth
  let authenticateHandler
  let revokeHandler
  let revokeAuth
  let verifyHandler

  const setAuthenticate = function (authenticate) {
    authenticateAuth = authenticate.auth
    authenticateHandler = authenticate.handler
  }

  const setRevoke = function (revoke) {
    revokeAuth = revoke.auth
    revokeHandler = revoke.handler
  }

  const setVerify = function (verify) {
    verifyHandler = verify
  }

  const verify = function (apiKey) {
    return verifyHandler(apiKey)
      .catch((err) => {
        return Promise.reject(new core.errors.Unauthorized(templates.authenticationRequiredError({
          message: err.message
        })))
      })
  }

  const apiKeyCreate = function (parameters, requestBody, response, userData) {
    return authenticateHandler(parameters, requestBody, response, userData)
      .then((apiKey) => {
        return Promise.resolve({
          apiKey: apiKey
        })
      })
  }

  const apiKeyCreateAuth = function (userData, params, body) {
    return authenticateAuth(userData, params, body)
  }

  const apiKeyRemove = function (parameters, requestBody, response, userData) {
    return revokeHandler(parameters, requestBody, response, userData)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  const apiKeyRemoveAuth = function (userData, params, body) {
    return revokeAuth(userData, params, body)
  }

  const set = function (options) {
    if (!options.authenticate || !options.revoke || !options.verify) {
      return Promise.reject(new core.errors.BadImplementation(templates.malFormedAuthenticationMethodError({
        method: 'apiKey'
      })))
    }
    setAuthenticate(options.authenticate)
    setRevoke(options.revoke)
    setVerify(options.verify)
    return Promise.resolve()
  }

  return {
    header: 'x-api-key',
    verify: verify,
    operations: {
      apiKeyCreate: {
        auth: apiKeyCreateAuth,
        handler: apiKeyCreate
      },
      apiKeyRemove: {
        auth: apiKeyRemoveAuth,
        handler: apiKeyRemove
      }
    },
    openApi: openApi,
    set: set
  }
}

module.exports = SecurityModule
