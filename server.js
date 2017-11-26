'use strict'

const core = require('./core')
const server = require('./lib/server')
const start = require('./cli/commands/start')

server.start(
  new core.Arguments().getOptions(start.options)
)
