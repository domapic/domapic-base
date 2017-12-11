'use strict'

const _ = require('lodash')

const Arguments = require('./bases/Arguments')
const Core = require('./bases/Core')
const Process = require('./bases/Process')
const start = require('./cli/start')
const stop = require('./cli/stop')
const logs = require('./cli/logs')

const Cli = function (options) {
  // TODO, remove promise from constructor. Now is useful only for error handling, implement it later, in upper layer
  return new Promise((resolve) => {
    options = options || {}

    const commands = _.extend({
      start: start,
      stop: stop,
      logs: logs
    }, options.commands || {})

    const getCliCommandsMethods = function (argsOptions) {
      return new Promise((resolve) => {
        const core = new Core(argsOptions)
        resolve({
          process: new Process({
            script: options.script,
            name: argsOptions.name
          }, core.paths, core.errors),
          tracer: core.tracer,
          errors: core.errors,
          paths: core.paths,
          config: core.config,
          utils: core.utils
        })
      })
    }

    const runCommand = function () {
      return new Arguments().runCommand(commands, getCliCommandsMethods)
    }

    resolve({
      runCommand: runCommand
    })
  })
}

module.exports = Cli
