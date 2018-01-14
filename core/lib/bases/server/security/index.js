'use strict'

const Jwt = require('./Jwt')
const ApiKey = require('./ApiKey')

const SecurityMethods = function (core) {
  return {
    jwt: new Jwt(core),
    apiKey: new ApiKey(core)
  }
}

module.exports = SecurityMethods
