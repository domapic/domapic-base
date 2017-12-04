'use strict'

const core = require('../../core')
const enums = require('../../lib/enums/log')

const startProcess = function (options) {
  const pm2Process = new core.Process({
    name: options.name,
    args: options
  })

  return pm2Process.start()
}

const start = function (options) {
  const log = new core.Log()

  return log.info(enums['starting-server-pm2'])
    .then(() => {
      return startProcess(options)
    })
    .then(() => {
      return log.info(enums['stop-process-instructions'])
    })
    .then(() => {
      return log.data(options)
    })
}

module.exports = {
  describe: 'Start the domapic controller server',
  cli: 'start [name]',
  options: {
    port: {
      type: 'number',
      alias: ['p'],
      describe: 'Listening port number for the controller server'
    },
    name: {
      type: 'string',
      alias: ['n'],
      describe: 'Server instance unique name'
    }
  },
  command: start
}
