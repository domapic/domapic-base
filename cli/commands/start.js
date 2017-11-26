'use strict'

const core = require('../../core')
const enums = require('../../lib/enums/log')

const start = function (options) {
  const log = new core.Log()
  log.info(enums['starting-server-pm2'])
  log.data(options)
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
