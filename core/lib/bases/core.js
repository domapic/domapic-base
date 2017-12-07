'use strict'

const _ = require('lodash')

const Arguments = require('./core/Arguments')
const Config = require('./core/Config')
const Errors = require('./core/Errors')
const Tracer = require('./core/Tracer')
const coreArguments = require('../arguments/core')
const Paths = require('./core/Paths')

// TODO, add utils

const Core = function (options) {
  const args = new Arguments(_.extend({}, coreArguments, options.args || {}))

  const userOptions = args.getOptions(null, {
    avoidDemand: options.avoidDemandOptions,
    help: !options.avoidOptionsHelp
  })

  const errors = new Errors()
  const paths = new Paths(userOptions, errors)
  const tracer = new Tracer(userOptions, paths, errors)
  const config = new Config(userOptions, paths, errors, tracer)

  return {
    arguments: args,
    errors: errors,
    config: config,
    tracer: tracer
  }
}

module.exports = Core
