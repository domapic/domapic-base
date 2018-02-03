'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const yargs = require('yargs')

const coreArguments = require('../arguments/core')
const utils = require('../utils')

const Arguments = function (baseArguments) {
  const defaultArguments = _.extend({}, coreArguments, baseArguments)

  const extendArguments = function (args) {
    _.each(args, (argProperties, argName) => {
      if (defaultArguments[argName]) {
        throw new Error(utils.templates.compiled.cli.overwriteOptionError({
          optionName: argName
        }))
      }
    })
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

  const getCliCommandOptionsNames = function (cliCommand) {
    const regex = /([[|<]\S*?[\]|>])/gm
    let matches
    let results = []

    while ((matches = regex.exec(cliCommand)) !== null) {
      matches.forEach((match, groupIndex) => {
        if (groupIndex > 0) {
          results.push(match)
        }
      })
    }
    return results
  }

  const getExplicitCommandOptions = function (processOptions, cliMethod) {
    let explicit = {}
    const cliOptionsNames = getCliCommandOptionsNames(cliMethod)
    const cliOptions = _.filter(processOptions, (option) => {
      return option.indexOf('-') !== 0
    })
    _.each(cliOptionsNames, (optionName, index) => {
      if (!_.isUndefined(cliOptions[index + 1])) {
        explicit[optionName.replace(/[[|\]|<|>]/g, '')] = cliOptions[index + 1]
      }
    })

    return explicit
  }

  const getExplicit = function (options, values, cliMethod) {
    let explicit = {}
    let processOptions = _.clone(process.argv)

    processOptions.splice(0, 2)
    if (cliMethod) {
      _.extend(explicit, getExplicitCommandOptions(processOptions, cliMethod))
    }

    let usualOptions = _.filter(processOptions, (option) => {
      return option.indexOf('-') === 0
    })

    _.each(usualOptions, (option) => {
      const splittedOption = option.split('=')
      const name = splittedOption[0].replace(/^-*/, '')
      _.each(options, (properties, optionName) => {
        if (name === optionName || (properties.alias && properties.alias.indexOf(name) > -1)) {
          explicit[optionName] = values && !_.isUndefined(values[optionName]) ? values[optionName] : (splittedOption.length > 1 ? splittedOption[1] : true)
        }
      })
    })

    return explicit
  }

  const Options = function (options) {
    return {
      get: function () {
        _.each(options, (properties, name) => {
          yargs.option(name, properties)
        })
      }
    }
  }

  const init = function () {
    yargs.strict()
    yargs.help().alias('h', 'help')
    yargs.wrap(yargs.terminalWidth())

    return yargs.parse()
  }

  const runCommand = function (commands, getCliCommandsMethods) {
    return new Promise((resolve, reject) => {
      _.forEach(commands, (properties) => {
        const extendedArguments = extendArguments(properties.options)

        yargs.command(properties.cli, properties.describe, new Options(extendedArguments).get, (argv) => {
          const userOptions = clean(argv, extendedArguments)
          const args = {
            options: userOptions,
            defaults: getDefaults(extendedArguments),
            explicit: getExplicit(extendedArguments, userOptions, properties.cli)
          }

          return getCliCommandsMethods(args, properties.processName)
            .then((cliCommandMethods) => {
              return cliCommandMethods.config.get()
                .then(configuration => {
                  return properties.command(configuration, cliCommandMethods, args)
                    .catch((error) => {
                      return cliCommandMethods.tracer.error(error)
                        .then(() => {
                          reject(error)
                        })
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
