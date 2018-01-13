'use strict'

const logsArguments = require('../arguments/logs')

const logs = function (config, cli) {
  const templates = cli.utils.templates.compiled.cli

  return cli.tracer.info(templates.displayingLogs({
    name: config.name
  }))
    .then(() => {
      return cli.process.logs(config)
    })
}

module.exports = {
  processName: 'logs',
  describe: 'Show domapic server logs',
  cli: 'logs [name]',
  options: logsArguments,
  command: logs
}
