'use strict'

const jwt = require('jsonwebtoken')

const openApi = require('./jwtOpenApi.json')

// TODO, random, from storage, or from configuration
const SECRET = 'dasdsndgfkdsfgdfotrwñweñtfmvkfng'

// TODO, extend all security methods from one constructor, to share the "set" methods

const SecurityModule = function (core) {
  const templates = core.utils.templates.compiled.server
  let authenticateHandler
  let rejectHandler

  const parseHeader = function (header) {
    return header.replace('Bearer ', '')
  }

  const verify = function (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
          reject(new core.errors.Unauthorized(templates.authenticationRequiredError({
            message: err.message
          })))
        } else {
          resolve(decoded)
        }
      })
    })
  }

  const sign = function () {

  }

  const authenticateOperation = function (parameters, requestBody, response) {
    return authenticateHandler(requestBody)
      .then((userDataOrToken) => {
        // TODO, sign user data. Get expires, and refreshToken

        return Promise.resolve({
          access_token: 'dasdafsdfsdf',
          expires_in: 300,
          refresh_token: 'dafsdfsdgfsasd34qw'
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
    header: 'authorization',
    parseHeader: parseHeader,
    sign: sign,
    verify: verify,
    openApi: openApi,
    operations: {
      jwtAuthenticate: {
        handler: authenticateOperation
      },
      jwtReject: {
        handler: rejectOperation
      }
    },
    setAuthenticate: setAuthenticate,
    setReject: setReject
  }
}

module.exports = SecurityModule
