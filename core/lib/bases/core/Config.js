'use strict'

const Promise = require('bluebird')

const Config = function (options, paths, errors, tracer) {
  // TODO, if no name is received, do not save options

  const get = function () {
    return Promise.resolve(options)
  }

  return {
    get: get
  }
}

module.exports = Config
