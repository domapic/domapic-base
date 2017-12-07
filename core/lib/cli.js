'use strict'

const _ = require('lodash')

const Core = require('./bases/core')
const Process = require('./bases/process')
const start = require('./cli/start')
const stop = require('./cli/stop')
const logs = require('./cli/logs')

const Cli = function (options) {
  options = options || {}

  const core = new Core({
    avoidDemandOptions: true,
    avoidOptionsHelp: true
  })

  let commands = _.extend({
    start: start,
    stop: stop,
    logs: logs
  }, options.commands || {})

  const runCommand = function () {
    return core.config.get()
      .then((config) => {
        if (!config.name) {
          return core.arguments.runCommand(commands) // no name, let yargs displays help for commands
        }
        return core.arguments.runCommand(commands, {
          process: new Process({
            script: options.script,
            name: config.name
          }),
          tracer: core.tracer,
          errors: core.errors,
          paths: core.paths,
          config: core.config
        })
      })
  }

  return {
    runCommand: runCommand
  }
}

module.exports = Cli
