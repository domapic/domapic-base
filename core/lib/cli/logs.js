'use strict'

const templates = require('./templates/logs')

const logs = function (options, cli) {
  /*
  // TODO
  templates = cli.utils.templates.compile(templates)

  return cli.tracer.info(templates.displayingLogs({
    name: options.name
  }))
  */
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
