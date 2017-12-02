
module.exports = {
  arguments: require('./core/lib/arguments.mocks'),
  log: require('./core/lib/log.mocks'),
  process: require('./core/lib/process.mocks'),
  commands: {
    start: require('./cli/commands/start.mocks'),
    stop: require('./cli/commands/stop.mocks'),
    logs: require('./cli/commands/logs.mocks')
  }
}
