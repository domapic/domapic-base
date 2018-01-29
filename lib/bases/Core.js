'use strict'

const core = require('./core/index')
const utils = require('../utils')

const STORAGE_FOLDER = 'storage/'
const CONFIG_FOLDER = 'config/'
const JSON_SUFFIX = '.json'

const Core = function (args, processName, packagePath) {
  const storageFile = STORAGE_FOLDER + processName + JSON_SUFFIX
  const configFile = CONFIG_FOLDER + processName + JSON_SUFFIX

  const errors = new core.Errors()
  const info = new core.Info(packagePath, errors)
  const paths = new core.Paths(args.options, errors)
  const storage = new core.Storage(storageFile, paths, errors)
  const config = new core.Config(new core.Storage(configFile, paths, errors), args, errors)
  const tracer = new core.Tracer(config, paths, errors)

  return {
    errors: errors,
    config: config,
    info: info,
    storage: storage,
    tracer: tracer,
    utils: utils,
    paths: paths
  }
}

module.exports = Core
