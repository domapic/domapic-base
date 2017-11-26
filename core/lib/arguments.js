'use strict'

const _ = require('lodash')

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
    get: function (yargs) {
      _.forEach(options, (properties, name) => {
        yargs.option(name, properties)
      })
    }
  }
}

const init = function (yargs, config) {
  yargs.strict()
  yargs.wrap(yargs.terminalWidth())
  yargs.help().alias('h', 'help')

  return yargs.argv
}

const registerCommands = function (commands, yargs) {
  _.forEach(commands, (properties) => {
    yargs.command(properties.cli, properties.describe, new Options(properties.options).get, (argv) => {
      properties.command(clean(argv, properties.options))
    })
  })

  yargs.demandCommand()

  init(yargs)
}

const getOptions = function (options, yargs) {
  new Options(options).get(yargs)
  return clean(init(yargs), options)
}

module.exports = {
  registerCommands: registerCommands,
  getOptions: getOptions
}
