'use strict'

const templates = require('./templates/logs')

const stop = function (options, cli) {
  return cli.tracer.info(templates.stoppingServerPm2({
    name: options.name
  }))
    .then(() => {
      return cli.process.stop()
    })
    .then(() => {
      return cli.tracer.info(templates.startServerHelp({
        name: options.name
      }))
    })
}

module.exports = {
  describe: 'Stop the domapic controller server',
  cli: 'stop [name]',
  command: stop
}
