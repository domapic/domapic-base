'use strict'

const Config = require('./core/Config')
const Errors = require('./core/Errors')
const Tracer = require('./core/Tracer')
const Paths = require('./core/Paths')
const utils = require('../utils')

const Core = function (options) {
  const errors = new Errors()
  const paths = new Paths(options, errors)
  const tracer = new Tracer(options, paths, errors)
  const config = new Config(options, paths, errors, tracer)

  return {
    errors: errors,
    config: config,
    tracer: tracer,
    utils: utils
  }
}

module.exports = Core
