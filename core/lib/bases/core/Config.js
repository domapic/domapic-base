'use strict'

const Promise = require('bluebird')

const Config = function (options, paths, errors, tracer) {
  // TODO, if no name is rec

  const get = function (key) {
    return Promise.resolve(options)
  }

  return {
    get: get
    /*
    set: set //set and save
    */

  }
}

module.exports = Config
