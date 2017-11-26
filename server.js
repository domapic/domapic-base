'use strict'

const yargs = require('yargs')

const core = require('./core')
const server = require('./lib/server')
const start = require('./cli/commands/start')

server.start(core.arguments.getOptions(start.options, yargs))
