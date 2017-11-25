'use strict'

const start = require('./cli/commands/start')
const args = require('./lib/utils/arguments')

start.command(args.getOptions(start.options))
