'use strict'

const path = require('path')

const core = require('../core')

new core.Cli({
  script: path.resolve(__dirname, '..', 'server.js')
}).then((cli) => {
  return cli.runCommand()
}).catch((error) => {
  console.error('ERROR: ' + error.message)
  console.error(error.stack)
  process.exit(1)
})
