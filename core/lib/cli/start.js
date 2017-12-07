'use strict'

const logsTemplates = require('./templates/logs')
const serviceArguments = require('../arguments/service')

const start = function (options, cli) {
  const templates = cli.utils.templates.compile(logsTemplates)

  return cli.tracer.info(templates.startingServerPm2({
    name: options.name
  }))
    .then(() => {
      return cli.process.start(options)
    })
    .then(() => {
      return cli.tracer.info(templates.stopServerHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.info(templates.displayLogsHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.data(options)
    })
}

module.exports = {
  describe: 'Start the domapic controller server',
  cli: 'start [name]',
  options: serviceArguments,
  command: start
}
