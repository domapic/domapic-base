'use strict'

const logsTemplates = require('./templates/logs')

const logs = function (options, cli) {
  const templates = cli.utils.templates.compile(logsTemplates)

  return cli.tracer.info(templates.displayingLogs({
    name: options.name
  }))
    .then(() => {
      return cli.process.logs(options)
    })
}

module.exports = {
  describe: 'Show domapic server logs',
  cli: 'logs [name]',
  command: logs
}
