'use strict'

const stop = function (config, cli) {
  const templates = cli.utils.templates.compiled.cli

  return cli.tracer.info(templates.stoppingService({
    name: config.name
  }))
    .then(() => {
      return cli.process.stop()
    })
    .then(() => {
      return cli.tracer.info(templates.startServiceHelp({
        usedCommand: cli.utils.process.getUsedCommand(),
        name: config.name
      }))
    })
}

module.exports = {
  processName: 'stop',
  describe: 'Stop the domapic controller service',
  cli: 'stop [name]',
  command: stop
}
