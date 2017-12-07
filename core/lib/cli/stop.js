'use strict'

const cliTemplates = require('../templates/cli')

const stop = function (options, cli) {
  const templates = cli.utils.templates.compile(cliTemplates)

  return cli.tracer.info(templates.stoppingService({
    name: options.name
  }))
    .then(() => {
      return cli.process.stop()
    })
    .then(() => {
      return cli.tracer.info(templates.startServiceHelp({
        name: options.name
      }))
    })
}

module.exports = {
  describe: 'Stop the domapic controller server',
  cli: 'stop [name]',
  command: stop
}
