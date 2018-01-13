'use strict'

const jwt = require('jsonwebtoken')
const Promise = require('bluebird')

// TODO /auth/token ->> handle both user/name or refresh_token

// TODO, generate secret, or from configuration
const serverTemplates = require('../../templates/server')
const secret = 'dasdsndgfkdsfgdfotrwñweñtfmvkfng'

const Security = function (options, core) {
  const templates = core.utils.templates.compile(serverTemplates)

  const authorize = function (operationId, credentials) {
    return options.authorization(operationId, credentials)
      .catch(() => {
        // TODO, log unathorized attempt
        return Promise.reject(new core.errors.Forbidden(templates.authorizationFailedError()))
      })
  }

  const Jwt = function () {
    const verifyToken = function (token) {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            reject(new core.errors.Unauthorized(templates.authenticationRequiredError()))
          } else {
            resolve(decoded)
          }
        })
      })
    }

    const ensureAuthenticationHeader = function (req) {
      if (!req.headers.authorization) {
        return Promise.reject(new core.errors.Unauthorized(templates.authenticationRequiredError()))
      }
      return Promise.resolve(req.headers.authorization)
    }

    const verify = function (req, res) {
      console.log('verifying')
      return ensureAuthenticationHeader(req)
        .then(verifyToken)
        .catch((err) => {
          res.set({
            'WWW-Authenticate': 'Bearer realm="Domapic service", charset="UTF-8"'
          })
          return Promise.reject(err)
        })
        .then((jwtDecoded) => {
          return authorize(req.operationId, jwtDecoded)
        })
    }

    return {
      verify: verify
    }
  }

  const Apikey = function () {
    const verify = function (req) {
      return Promise.resolve()
    }

    return {
      verify: verify
    }
  }

  return options.authenticationMethod === 'jwt' ? new Jwt() : new Apikey()
}

module.exports = Security
