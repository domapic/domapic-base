'use strict'

const Config = require('./lib/config')

module.exports = function (options) {
  return new Config(options)
}
