'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const yargs = require('yargs')

const Arguments = function (defaultOptions) {
  const extendOptions = function (options) {
    return _.extend({}, defaultOptions, options || {})
  }

  const clean = function (argv, options) {
    _.forEach(argv, (value, key) => {
      if (_.isUndefined(options[key])) {
        delete argv[key]
      }
    })
    return argv
  }

  const Options = function (options, avoidDemand) {
    return {
      get: function () {
        _.forEach(options, (properties, name) => {
          const props = _.clone(properties)
          if (avoidDemand && props.demandOption) {
            props.demandOption = false
          }
          yargs.option(name, props)
        })
      }
    }
  }

  const init = function (config) {
    config = config || {}
    if (config.strict) {
      yargs.strict()
    }
    if (config.help) {
      yargs.help(true).alias('h', 'help')
    } else {
      yargs.help(false)
    }

    yargs.wrap(yargs.terminalWidth())

    return yargs.argv
  }

  const runCommand = function (commands, publicMethods) {
    return new Promise((resolve) => {
      _.forEach(commands, (properties) => {
        const extendedOptions = extendOptions(properties.options)

        yargs.command(properties.cli, properties.describe, new Options(extendedOptions).get, (argv) => {
          properties.command(clean(argv, extendedOptions), publicMethods)
            .catch((error) => {
              publicMethods.tracer.error('ERROR: ' + error.message)
              process.exit(1)
            })
        })
      })

      yargs.demandCommand()

      init({
        strict: true,
        help: true
      })
      resolve()
    })
  }

  const getOptions = function (options, config) {
    const extendedOptions = extendOptions(options)
    new Options(extendedOptions, config.avoidDemand).get()
    return clean(init(config), extendedOptions)
  }

  return {
    runCommand: runCommand,
    getOptions: getOptions
  }
}

module.exports = Arguments
