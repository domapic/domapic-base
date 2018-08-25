'use strict'

const jwt = require('jsonwebtoken')
const randToken = require('rand-token')

const openApi = require('./openapi.json')

const SecurityModule = function (core) {
  const templates = core.utils.templates.compiled.server
  let secret
  let expiresIn
  let authenticateAuth
  let authenticateHandler
  let revokeHandler
  let revokeAuth

  const setSecret = function (secretToSet) {
    secret = secretToSet || randToken.generate(32)
  }

  const setExpires = function (expires) {
    expiresIn = expires || 300
  }

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
      jwt.verify(token, secret, (err, decoded) => {
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
      jwt.sign(userData, secret, {
        expiresIn: expiresIn
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
              expiresIn: expiresIn * 1000
            }
            if (userDataAndToken.refreshToken) {
              response.refreshToken = userDataAndToken.refreshToken
            }
            return Promise.resolve(response)
          })
      }).catch(() => Promise.reject(new core.errors.Unauthorized(templates.authenticationRequiredError())))
  }

  const authCreateToken = function (userData, params, body) {
    return authenticateAuth(userData, params, body)
  }

  const removeRefreshToken = function (parameters, requestBody, response) {
    return revokeHandler(requestBody)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  const authRemoveRefreshToken = function (userData, params, body) {
    return revokeAuth(userData, params, body)
  }

  const set = function (options) {
    if (!options.authenticate || !options.revoke) {
      return Promise.reject(new core.errors.BadImplementation(templates.malFormedAuthenticationMethodError({
        method: 'jwt'
      })))
    }
    setAuthenticate(options.authenticate)
    setRevoke(options.revoke)
    setSecret(options.secret)
    setExpires(options.expiresIn)
    return Promise.resolve()
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
    set: set
  }
}

module.exports = SecurityModule
