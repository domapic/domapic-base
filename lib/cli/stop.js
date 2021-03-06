'use strict'

const Promise = require('bluebird')

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
        customName: cli.utils.cli.usedCustomName(config.name, cli.info),
        usedCommand: cli.utils.cli.usedCommand()
      }))
    })
    .catch((err) => {
      if (cli.errors.isControlled(err)) {
        return cli.tracer.error(err.message)
      }
      return Promise.reject(err)
    })
}

module.exports = {
  processName: 'stop',
  describe: 'Stop the service',
  cli: 'stop [name]',
  command: stop
}
