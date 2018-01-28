'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const UNSTORABLE_CONFIG = ['name', 'saveConfig']

const Config = function (storage, args, errors) {
  let buildConfigPromise
  const checkDefaults = function (storedConfig) {
    let hasToUpdate
    _.each(args.defaults, (value, key) => {
      if (_.isUndefined(storedConfig[key]) && UNSTORABLE_CONFIG.indexOf(key) < 0) {
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

  const storeConfig = function (finalConfig) {
    let configToStore = JSON.parse(JSON.stringify(finalConfig))
    _.each(UNSTORABLE_CONFIG, (configKey) => {
      delete configToStore[configKey]
    })
    if (args.explicit.saveConfig === true) {
      return storage.set(configToStore)
        .then(() => {
          return Promise.resolve(finalConfig)
        })
    }
    return Promise.resolve(finalConfig)
  }

  const buildConfig = function () {
    if (!buildConfigPromise) {
      buildConfigPromise = storage.get()
        .then(checkDefaults)
        .then(extendWithOptions)
        .then(storeConfig)
        .then((config) => {
          return Promise.resolve(config)
        })
    }
    return buildConfigPromise
  }

  const get = function (key) {
    return buildConfig()
      .then((config) => {
        return Promise.resolve(key ? config[key] : config)
      })
  }

  return {
    get: get
  }
}

module.exports = Config
