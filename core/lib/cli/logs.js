'use strict'

const cliTemplates = require('../templates/cli')
const logsArguments = require('../arguments/logs')

const logs = function (options, cli) {
  const templates = cli.utils.templates.compile(cliTemplates)

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
  options: logsArguments,
  command: logs
}
