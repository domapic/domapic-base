'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const utils = require('../../utils')

const UNSTORABLE_CONFIG = ['name', 'saveConfig']

const Config = function (storage, args, errors) {
  let buildConfigPromise
  let _config

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
    return Promise.resolve(_.extend(storedConfig, { name: args.options.name }, args.explicit))
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

  const returnConfig = function (key) {
    const configClone = JSON.parse(JSON.stringify(_config))
    return Promise.resolve(key ? configClone[key] : configClone)
  }

  const get = function (key) {
    if (_config) {
      return returnConfig(key)
    }
    return buildConfig()
      .then((config) => {
        _config = config
        return returnConfig(key)
      })
  }

  const set = function (key, value) {
    if (!key) {
      return Promise.reject(new errors.BadData(utils.templates.compiled.storage.invalidKeyError({
        key: typeof key
      })))
    }
    return get(key)
      .then(() => {
        return storage.set(key, value)
      })
      .then(() => {
        _config[key] = value
        return get(key)
      })
  }

  return {
    get: get,
    set: set
  }
}

module.exports = Config
