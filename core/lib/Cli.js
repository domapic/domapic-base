'use strict'

const _ = require('lodash')

const Arguments = require('./bases/Arguments')
const Core = require('./bases/Core')
const Process = require('./bases/Process')
const start = require('./cli/start')
const stop = require('./cli/stop')
const logs = require('./cli/logs')

const Cli = function (options) {
  options = options || {}

  const commands = _.extend({
    start: start,
    stop: stop,
    logs: logs
  }, options.commands || {})

  const getPublicMethods = function (argsOptions) {
    const core = new Core(argsOptions)
    return {
      process: new Process({
        script: options.script,
        name: argsOptions.name
      }, core.paths),
      tracer: core.tracer,
      errors: core.errors,
      paths: core.paths,
      config: core.config,
      utils: core.utils
    }
  }

  const runCommand = function () {
    return new Arguments().runCommand(commands, getPublicMethods)
  }

  return {
    runCommand: runCommand
  }
}

module.exports = Cli
