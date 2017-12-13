'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const yargs = require('yargs')

const coreArguments = require('../arguments/core')

const Arguments = function (baseArguments) {
  const defaultArguments = _.extend({}, coreArguments, baseArguments)

  const extendArguments = function (args) {
    return _.extend({}, defaultArguments, args || {})
  }

  const clean = function (argv, options) {
    _.each(argv, (value, key) => {
      if (_.isUndefined(options[key])) {
        delete argv[key]
      }
    })
    return argv
  }

  const getDefaults = function (options) {
    let defaults = {}
    _.each(options, (properties, key) => {
      if (!_.isUndefined(properties.default)) {
        defaults[key] = properties.default
      }
    })
    return defaults
  }

  const getExplicit = function (options, values) {
    return {}
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

  const runCommand = function (commands, getCliCommandsMethods) {
    return new Promise((resolve, reject) => {
      _.forEach(commands, (properties) => {
        const extendedArguments = extendArguments(properties.options)

        yargs.command(properties.cli, properties.describe, new Options(extendedArguments).get, (argv) => {
          const userOptions = clean(argv, extendedArguments)
          return getCliCommandsMethods({
            options: userOptions,
            defaults: getDefaults(extendedArguments),
            explicit: getExplicit(extendedArguments, userOptions)
          })
            .then((cliCommandMethods) => {
              return properties.command(userOptions, cliCommandMethods)
                .catch((error) => {
                  return cliCommandMethods.tracer.error(error)
                    .then(() => {
                      reject(error)
                    })
                })
            })
            .then(() => {
              resolve()
            })
            .catch((error) => {
              reject(error)
            })
        })
      })

      yargs.demandCommand()

      init()
    })
  }

  const get = function () {
    return new Promise((resolve) => {
      new Options(defaultArguments).get()
      const options = clean(init(), defaultArguments)

      resolve({
        options: options,
        defaults: getDefaults(defaultArguments),
        explicit: getExplicit(defaultArguments, options)
      })
    })
  }

  return {
    runCommand: runCommand,
    get: get
  }
}

module.exports = Arguments
