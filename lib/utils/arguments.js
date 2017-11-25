'use strict'

const yargs = require('yargs')
const _ = require('lodash')

const KEYS_TO_REMOVE = [
  '_',
  'version',
  'help',
  'h',
  '$0'
]

const clean = function (argv) {
  _.forEach(KEYS_TO_REMOVE, (key) => {
    delete argv[key]
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

const init = function () {
  return yargs.wrap(yargs.terminalWidth())
    .help()
    .alias('h', 'help')
    .strict()
    .argv
}

const registerCommands = function (commands) {
  _.forEach(commands, (properties) => {
    yargs.command(properties.cli, properties.describe, new Options(properties.options).get, (argv) => {
      properties.command(clean(argv))
    })
  })

  yargs.demandCommand()

  init()
}

const getOptions = function (options) {
  new Options(options).get(yargs)
  return clean(init())
}

module.exports = {
  registerCommands: registerCommands,
  getOptions: getOptions
}
