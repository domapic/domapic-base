'use strict'

const Promise = require('bluebird')

const Config = function (storage, args, errors) {
  let buildConfigPromise

  const checkDefaults = function (storedConfig) {

  }

  const extendWithOptions = function (storedConfig) {

  }

  const buildConfig = function () {
    if (!buildConfigPromise) {
      return storage.get()
        .then(checkDefaults)
        .then(extendWithOptions)
    }
    return buildConfigPromise
  }

  const get = function (key) {
    return buildConfig()
      .then((config) => {
        console.log(args)
        return Promise.resolve(args.options)
      })
  }

  return {
    get: get
  }
}

module.exports = Config
