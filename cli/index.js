'use strict'

const core = require('../core')
const start = require('./commands/start')

new core.Arguments().registerCommands({
  start: start
})
