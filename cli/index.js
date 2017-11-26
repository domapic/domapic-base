'use strict'

const yargs = require('yargs')

const core = require('../core')
const start = require('./commands/start')

const args = new core.Arguments(yargs)

args.registerCommands({
  start: start
})
