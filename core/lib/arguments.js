'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const yargs = require('yargs')

const Arguments = function () {
  const clean = function (argv, options) {
    _.forEach(argv, (value, key) => {
      if (_.isUndefined(options[key])) {
        delete argv[key]
      }
    })
    return argv
  }

  const Options = function (options) {
    return {
      get: function () {
        _.forEach(options, (properties, name) => {
          yargs.option(name, properties)
        })
      }
    }
  }

  const init = function (config) {
    yargs.strict()
    yargs.wrap(yargs.terminalWidth())
    yargs.help().alias('h', 'help')

    return yargs.argv
  }

  const registerCommands = function (commands) {
    return new Promise((resolve) => {
      _.forEach(commands, (properties) => {
        yargs.command(properties.cli, properties.describe, new Options(properties.options).get, (argv) => {
          properties.command(clean(argv, properties.options))
        })
      })

      yargs.demandCommand()

      init()
      resolve()
    })
  }

  const getOptions = function (options) {
    return new Promise((resolve) => {
      new Options(options).get()
      resolve(clean(init(), options))
    })
  }

  return {
    registerCommands: registerCommands,
    getOptions: getOptions
  }
}

module.exports = Arguments
