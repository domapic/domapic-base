'use strict'

const Config = require('./core/Config')
const Errors = require('./core/Errors')
const Storage = require('./core/Storage')
const Tracer = require('./core/Tracer')
const Paths = require('./core/Paths')
const utils = require('../utils')

const STORAGE_FOLDER = 'storage/'
const CONFIG_FOLDER = 'config/'

const Core = function (args, processName) {
  const storageFile = STORAGE_FOLDER + processName + '.json'
  const configFile = CONFIG_FOLDER + processName + '.json'

  const errors = new Errors()
  const paths = new Paths(args.options, errors)
  const storage = new Storage(storageFile, paths, errors)
  const config = new Config(new Storage(configFile, paths, errors), args, errors)
  const tracer = new Tracer(config, paths, errors)

  return {
    errors: errors,
    config: config,
    storage: storage,
    tracer: tracer,
    utils: utils,
    paths: paths
  }
}

module.exports = Core
