'use strict'

const cliTemplates = require('../templates/cli')
const serviceArguments = require('../arguments/service')

const start = function (options, cli) {
  const templates = cli.utils.templates.compile(cliTemplates)

  return cli.tracer.info(templates.startingService({
    name: options.name
  }))
    .then(() => {
      return cli.tracer.log(templates.stopServiceHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.trace(templates.stopServiceHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.debug(templates.stopServiceHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.info(templates.stopServiceHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.warn(templates.stopServiceHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.process.start(options)
    })
    .then(() => {
      return cli.tracer.info(templates.stopServiceHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.info(templates.displayLogsHelp({
        name: options.name
      }))
    })
    .then(() => {
      return cli.tracer.debug(options)
    })
}

module.exports = {
  describe: 'Start the domapic controller server',
  cli: 'start [name]',
  options: serviceArguments,
  command: start
}
