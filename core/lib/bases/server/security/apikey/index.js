'use strict'

const openApi = require('./openapi.json')

const SecurityModule = function (core) {
  const templates = core.utils.templates.compiled.server
  let authenticateHandler
  let rejectHandler

  const setAuthenticate = function (authenticate) {
    authenticateHandler = authenticate
  }

  const setReject = function (reject) {
    rejectHandler = reject
  }

  const verify = function (token) {
    console.log('api key')
    console.log(token)
    return Promise.reject(new core.errors.Unauthorized(templates.authenticationRequiredError({
      message: templates.invalidApiKeyError()
    })))
  }

  const sign = function () {

  }

  const apiKeyCreate = function (parameters, requestBody, response) {
    return authenticateHandler(requestBody)
      .then((apiKey) => {
        // TODO, check standard method to work with api keys
        return Promise.resolve({
          api_key: apiKey,
          expires_in: 300
        })
      })
  }

  const apiKeyRemove = function (parameters, requestBody, response) {
    return rejectHandler(requestBody)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  return {
    header: 'x-api-key',
    sign: sign,
    verify: verify,
    operations: {
      apiKeyCreate: {
        handler: apiKeyCreate
      },
      apiKeyRemove: {
        handler: apiKeyRemove
      }
    },
    openApi: openApi,
    setAuthenticate: setAuthenticate,
    setReject: setReject
  }
}

module.exports = SecurityModule
