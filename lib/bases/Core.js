'use strict'

const core = require('./core/index')
const utils = require('../utils')

const STORAGE_FOLDER = 'storage/'
const CONFIG_FOLDER = 'config/'

const Core = function (args, processName) {
  const storageFile = STORAGE_FOLDER + processName + '.json'
  const configFile = CONFIG_FOLDER + processName + '.json'

  const errors = new core.Errors()
  const paths = new core.Paths(args.options, errors)
  const storage = new core.Storage(storageFile, paths, errors)
  const config = new core.Config(new core.Storage(configFile, paths, errors), args, errors)
  const tracer = new core.Tracer(config, paths, errors)

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
