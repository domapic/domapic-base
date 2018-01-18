'use strict'

const openApi = require('./openapi.json')

const SecurityModule = function (core) {
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
  }

  const apiKeyCreate = function (parameters, requestBody, response) {
    return authenticateHandler(requestBody)
      .then((apiKey) => {
        return Promise.resolve({
          apiKey: apiKey
        })
      })
  }

  const apiKeyCreateAuth = function (userData) {
    return authenticateAuth(userData)
  }

  const apiKeyRemove = function (parameters, requestBody, response) {
    return revokeHandler(requestBody)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  const apiKeyRemoveAuth = function (userData) {
    return revokeAuth(userData)
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
    setAuthenticate: setAuthenticate,
    setVerify: setVerify,
    setRevoke: setRevoke
  }
}

module.exports = SecurityModule
