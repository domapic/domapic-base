'use strict'

const Config = require('./core/Config')
const Errors = require('./core/Errors')
const Storage = require('./core/Storage')
const Tracer = require('./core/Tracer')
const Paths = require('./core/Paths')
const utils = require('../utils')

const STORAGE_FILE = 'storage.json'
const CONFIG_FILE = 'config.json'

const Core = function (args) {
  const errors = new Errors()
  const paths = new Paths(args.options, errors)
  const storage = new Storage(STORAGE_FILE, paths, errors)
  const config = new Config(new Storage(CONFIG_FILE, paths, errors), args, errors)
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
