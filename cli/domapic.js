'use strict'

const start = require('./commands/start')
const args = require('../lib/utils/arguments')

const commands = {
  start: start
}

args.registerCommands(commands)
