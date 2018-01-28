'use strict'

const serviceArguments = require('../arguments/service')

const start = function (config, cli) {
  const templates = cli.utils.templates.compiled.cli

  return cli.tracer.info(templates.startingService({
    name: config.name
  }))
    .then(() => {
      return cli.process.start(config)
    })
    .then(() => {
      return cli.tracer.group([
        {info: templates.stopServiceHelp({name: config.name})},
        {info: templates.displayLogsHelp({name: config.name})},
        {debug: ['Config:', config]}
      ])
    })
}

module.exports = {
  processName: 'service',
  describe: 'Start the domapic controller service',
  cli: 'start [name]',
  options: serviceArguments,
  command: start
}
