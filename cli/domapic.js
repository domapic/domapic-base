'use strict'

const yargs = require('yargs')

const start = require('./commands/start')
const core = require('../core')

const commands = {
  start: start
}

core.arguments.registerCommands(commands, yargs)
