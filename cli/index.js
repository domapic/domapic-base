'use strict'

const path = require('path')

const core = require('../core')

const cli = new core.Cli({
  script: path.resolve(__dirname, '..', 'server.js')
})

cli.runCommand().catch(() => {
  process.exit(1)
})
