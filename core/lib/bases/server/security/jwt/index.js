'use strict'

const jwt = require('jsonwebtoken')

const openApi = require('./openapi.json')

// TODO, random, from storage, or from configuration
const SECRET = 'dasdsndgfkdsfgdfotrwñweñtfmvkfng'

// TODO, extend all security methods from one constructor, to share the "set" methods

const EXPIRES_IN = 300

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
              access_token: accessToken,
              expires_in: EXPIRES_IN * 1000
            }
            if (userDataAndToken.refresh_token) {
              response.refresh_token = userDataAndToken.refresh_token
            }
            return Promise.resolve(response)
          })
      })
  }

  const removeRefreshToken = function (parameters, requestBody, response) {
    return rejectHandler(requestBody)
      .then(() => {
        response.status(204)
        return Promise.resolve()
      })
  }

  return {
    header: 'authorization',
    parseHeader: parseHeader,
    sign: sign,
    verify: verify,
    openApi: openApi,
    operations: {
      jwtCreateToken: {
        handler: createToken
      },
      jwtRemoveRefreshToken: {
        handler: removeRefreshToken
      }
    },
    setAuthenticate: setAuthenticate,
    setReject: setReject
  }
}

module.exports = SecurityModule
