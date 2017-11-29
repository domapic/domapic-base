'use strict'

const core = require('./core')
const server = require('./lib/server')
const start = require('./cli/commands/start')

new core.Arguments().getOptions(start.options)
  .then(server.start)
  .then(() => {
    setTimeout(() => {
      console.log('finished', 120000)
    })
  })
