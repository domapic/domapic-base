'use strict'

const jwt = require('jsonwebtoken')

const openApi = require('./openapi.json')

// TODO, random, from storage, or from configuration
const SECRET = 'dasdsndgfkdsfgdfotrwñweñtfmvkfng'

const EXPIRES_IN = 300

const SecurityModule = function (core) {
  const templates = core.utils.templates.compiled.server
  let authenticateAuth
  let authenticateHandler
  let revokeHandler
  let revokeAuth

  const setAuthenticate = function (authenticate) {
    authenticateAuth = authenticate.auth
    authenticateHandler = authenticate.handler
  }

  const setRevoke = function (revoke) {
    revokeAuth = revoke.auth
    revokeHandler = revoke.handler
  }

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

  const sign = function (userData) {
    return new Promise((resolve, reject) => {
      jwt.sign(userData, SECRET, {
        expiresIn: EXPIRES_IN
      }, (err, token) => {
        if (err) {
          reject(err)
        } else {
          resolve(token)
        }
      })
    })
  }

  const createToken = function (parameters, requestBody, response) {
    return authenticateHandler(requestBody)
      .then((userDataAndToken) => {
        return sign(userDataAndToken.userData)
          .then((accessToken) => {
            let response = {
              accessToken: accessToken,
              expiresIn: EXPIRES_IN * 1000
            }
            if (userDataAndToken.refreshToken) {
              response.refreshToken = userDataAndToken.refreshToken
            }
            return Promise.resolve(response)
          })
      })
  }

  const authCreateToken = function (userData) {
    return authenticateAuth(userData)
  }

  const removeRefreshToken = function (parameters, requestBody, response) {
    return revokeHandler(requestBody)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  const authRemoveRefreshToken = function (userData) {
    return revokeAuth(userData)
  }

  return {
    header: 'authorization',
    parseHeader: parseHeader,
    verify: verify,
    openApi: openApi,
    operations: {
      jwtCreateToken: {
        auth: authCreateToken,
        handler: createToken
      },
      jwtRemoveRefreshToken: {
        auth: authRemoveRefreshToken,
        handler: removeRefreshToken
      }
    },
    setAuthenticate: setAuthenticate,
    setRevoke: setRevoke
  }
}

module.exports = SecurityModule
