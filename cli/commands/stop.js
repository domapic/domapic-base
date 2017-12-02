'use strict'

const path = require('path')

const core = require('../../core')
const enums = require('../../lib/enums/log')

const stopProcess = function (options) {
  const pm2Process = new core.Process({
    name: options.name,
    script: path.resolve(__dirname, '..', '..', 'server.js'),
    cwd: process.cwd(),
    args: options
  })

  return pm2Process.stop()
}

const stop = function (options) {
  const log = new core.Log()

  return log.info(enums['stopping-server-pm2'])
    .then(() => {
      return stopProcess(options)
    })
    .then(() => {
      return log.info(enums['start-process-instructions'])
    })
}

module.exports = {
  describe: 'Stop the domapic controller server',
  cli: 'stop [name]',
  options: {
    name: {
      type: 'string',
      alias: ['n'],
      describe: 'Server instance unique name'
    }
  },
  command: stop
}
