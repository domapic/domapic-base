'use strict'

const Jwt = require('./jwt')
const ApiKey = require('./apikey')

const SecurityMethods = function (core) {
  return {
    jwt: new Jwt(core),
    apiKey: new ApiKey(core)
  }
}

module.exports = SecurityMethods
