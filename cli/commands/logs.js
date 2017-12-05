'use strict'

const core = require('../../core')
const enums = require('../../lib/enums/log')

const processLogs = function (options) {
  const pm2Process = new core.Process({
    name: options.name,
    args: options
  })

  return pm2Process.logs()
}

const logs = function (options) {
  const log = new core.Log()

  return log.info(enums['flushing-pm2-logs'])
    .then(() => {
      return processLogs(options)
    })
}

module.exports = {
  describe: 'Show domapic server logs',
  cli: 'logs [name]',
  options: {
    name: {
      type: 'string',
      alias: ['n'],
      describe: 'Server instance unique name'
    }
  },
  command: logs
}
