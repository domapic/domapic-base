'use strict'

const _ = require('lodash')

const utils = require('./utils')
const bases = require('./bases')
const start = require('./cli/start')
const stop = require('./cli/stop')
const logs = require('./cli/logs')
const coreArguments = require('./arguments/core')

const extendCommands = function (commands, customConfig) {
  const baseCommands = {
    start: _.cloneDeep(start),
    stop: stop,
    logs: logs
  }
  customConfig = customConfig || {}
  commands = commands || {}
  _.each(commands, (commandProperties, commandName) => {
    if (baseCommands[commandName]) {
      throw new Error(utils.templates.compiled.cli.overwriteCommandError({
        commandName: commandName
      }))
    }
  })

  _.each(customConfig, (optionProperties, optionName) => {
    if (baseCommands.start.options[optionName] || coreArguments[optionName]) {
      throw new Error(utils.templates.compiled.cli.overwriteStartOptionError({
        optionName: optionName
      }))
    }
  })

  _.extend(baseCommands.start.options, customConfig)

  return _.extend({}, baseCommands, commands)
}

const cli = function (options) {
  options = options || {}

  const commands = extendCommands(options.customCommands, options.customConfig)

  const getCliCommandsMethods = function (argsOptions, processName) {
    return new Promise((resolve, reject) => {
      const core = new bases.Core(argsOptions, processName, options && options.packagePath)
      core.config.get()
        .then((configuration) => {
          const pm2Process = new bases.Process({
            script: options.script,
            name: configuration.name
          }, core)

          resolve({
            process: pm2Process,
            tracer: core.tracer,
            info: core.info,
            errors: core.errors,
            config: core.config,
            utils: core.utils
          })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  return new bases.Arguments().runCommand(commands, getCliCommandsMethods)
}

module.exports = cli
