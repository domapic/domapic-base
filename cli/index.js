'use strict'

const path = require('path')

const core = require('../core')

new core.Cli({
  script: path.resolve(__dirname, '..', 'server.js')
}).runCommand()
