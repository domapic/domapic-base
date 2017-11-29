'use strict'

const core = require('../core')
const start = require('./commands/start')
const stop = require('./commands/stop')
const logs = require('./commands/logs')

new core.Arguments().registerCommands({
  start: start,
  stop: stop,
  logs: logs
})
