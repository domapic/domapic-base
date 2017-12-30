'use strict'

const _ = require('lodash')

const bases = require('./bases')
const start = require('./cli/start')
const stop = require('./cli/stop')
const logs = require('./cli/logs')

const Cli = function (options) {
  // TODO, remove promise from constructor. Now it is useful only for error handling, implement it later, in upper layer

  return new Promise((resolve) => {
    options = options || {}

    const commands = _.extend({
      start: start,
      stop: stop,
      logs: logs
    }, options.commands || {})

    const getCliCommandsMethods = function (argsOptions, processName) {
      return new Promise((resolve, reject) => {
        const core = new bases.Core(argsOptions, processName)
        core.config.get()
          .then((configuration) => {
            const pm2Process = new bases.Process({
              script: options.script,
              name: configuration.name
            }, core)

            resolve({
              process: pm2Process,
              tracer: core.tracer,
              errors: core.errors,
              paths: core.paths,
              config: core.config,
              utils: core.utils
            })
          })
          .catch((err) => {
            reject(err)
          })
      })
    }

    const runCommand = function () {
      return new bases.Arguments().runCommand(commands, getCliCommandsMethods)
    }

    resolve({
      runCommand: runCommand
    })
  })
}

module.exports = Cli
