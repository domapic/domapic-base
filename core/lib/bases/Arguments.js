'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const yargs = require('yargs')

const coreArguments = require('../arguments/core')

const Arguments = function (baseArguments) {
  const defaultArguments = _.extend({}, coreArguments, baseArguments)

  const extendOptions = function (options) {
    return _.extend({}, defaultArguments, options || {})
  }

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

  const init = function () {
    yargs.strict()
    yargs.help().alias('h', 'help')
    yargs.wrap(yargs.terminalWidth())

    return yargs.argv
  }

  const runCommand = function (commands, publicMethods) {
    return new Promise((resolve, reject) => {
      _.forEach(commands, (properties) => {
        const extendedOptions = extendOptions(properties.options)

        yargs.command(properties.cli, properties.describe, new Options(extendedOptions).get, (argv) => {
          const userOptions = clean(argv, extendedOptions)
          properties.command(userOptions, publicMethods(userOptions))
            .catch((error) => {
              publicMethods.tracer.error(error.message)
              reject(error)
            })
            .then(() => {
              resolve()
            })
        })
      })

      yargs.demandCommand()

      init()
    })
  }

  const getOptions = function () {
    new Options(defaultArguments).get()
    return clean(init(), defaultArguments)
  }

  return {
    runCommand: runCommand,
    getOptions: getOptions
  }
}

module.exports = Arguments
