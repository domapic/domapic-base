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

  const runCommand = function (commands, getCliCommandsMethods) {
    return new Promise((resolve, reject) => {
      _.forEach(commands, (properties) => {
        const extendedOptions = extendOptions(properties.options)

        yargs.command(properties.cli, properties.describe, new Options(extendedOptions).get, (argv) => {
          const userOptions = clean(argv, extendedOptions)
          return getCliCommandsMethods(userOptions)
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
        })
      })

      yargs.demandCommand()

      init()
    })
  }

  const getOptions = function () {
    new Options(defaultArguments).get()
    return Promise.resolve(clean(init(), defaultArguments))
  }

  return {
    runCommand: runCommand,
    getOptions: getOptions
  }
}

module.exports = Arguments
