'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Config = function (storage, args, errors) {
  let buildConfigPromise

  const checkDefaults = function (storedConfig) {
    let hasToUpdate
    _.each(args.defaults, (value, key) => {
      if (_.isUndefined(storedConfig[key])) {
        storedConfig[key] = value
        hasToUpdate = true
      }
    })
    if (hasToUpdate) {
      return storage.set(storedConfig)
    }
    return Promise.resolve(storedConfig)
  }

  const extendWithOptions = function (storedConfig) {
    return Promise.resolve(_.extend(storedConfig, args.explicit))
  }

  const buildConfig = function () {
    if (!buildConfigPromise) {
      buildConfigPromise = storage.get()
        .then(checkDefaults)
        .then(extendWithOptions)
        .then((config) => {
          return Promise.resolve(config)
        })
    }
    return buildConfigPromise
  }

  const get = function (key) {
    return buildConfig()
      .then((config) => {
        return Promise.resolve(config)
      })
  }

  return {
    get: get
  }
}

module.exports = Config
