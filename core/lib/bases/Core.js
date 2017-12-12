'use strict'

const Config = require('./core/Config')
const Errors = require('./core/Errors')
const Tracer = require('./core/Tracer')
const Paths = require('./core/Paths')
const utils = require('../utils')

const Core = function (options) {
  const errors = new Errors()
  const paths = new Paths(options, errors)
  const config = new Config(options, paths, errors)
  const tracer = new Tracer(config, paths, errors)

  return {
    errors: errors,
    config: config,
    tracer: tracer,
    utils: utils,
    paths: paths
  }
}

module.exports = Core
