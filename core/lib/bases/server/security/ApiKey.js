'use strict'

const openApi = require('./ApiKeyOpenApi.json')

const SecurityModule = function (core) {
  const templates = core.utils.templates.compiled.server
  let authenticateHandler
  let rejectHandler

  const verify = function (token) {
    console.log('api key')
    console.log(token)
    return Promise.reject(new core.errors.Unauthorized(templates.authenticationRequiredError({
      message: templates.invalidApiKeyError()
    })))
  }

  const sign = function () {

  }

  const authenticateOperation = function (parameters, requestBody, response) {
    return authenticateHandler(requestBody)
      .then((apiKey) => {
        // TODO, check standard method to work with apoi keys
        return Promise.resolve({
          api_key: apiKey,
          expires_in: 300
        })
      })
  }

  const rejectOperation = function (parameters, requestBody, response) {
    return rejectHandler(requestBody)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  const setAuthenticate = function (authenticate) {
    authenticateHandler = authenticate
  }

  const setReject = function (reject) {
    rejectHandler = reject
  }

  return {
    header: 'x-api-key',
    sign: sign,
    verify: verify,
    operations: {
      apiKeyAuthenticate: {
        handler: authenticateOperation
      },
      apiKeyReject: {
        handler: rejectOperation
      }
    },
    openApi: openApi,
    setAuthenticate: setAuthenticate,
    setReject: setReject
  }
}

module.exports = SecurityModule
