'use strict'

const utils = require('../utils')

module.exports = {
  name: {
    type: 'string',
    alias: ['n'],
    describe: 'Service instance unique name',
    demandOption: true
  },
  color: {
    type: 'boolean',
    alias: ['logColor'],
    describe: 'Use colors in logs',
    default: true
  },
  logLevel: {
    type: 'string',
    alias: ['loglevel'],
    describe: 'Log level',
    choices: ['log', 'trace', 'debug', 'info', 'warn', 'error'],
    default: 'info'
  },
  path: {
    type: 'string',
    describe: 'Path to be used as Domapic home path (.domapic folder will be created inside)',
    normalize: true,
    coerce: utils.cli.toAbsolutePath
  },
  saveConfig: {
    type: 'boolean',
    alias: ['save'],
    describe: 'Save current configuration parameters for next executions',
    default: false
  }
}
