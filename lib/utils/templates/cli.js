'use strict'

module.exports = {
  overwriteCommandError: 'Command "{{commandName}}" already exists in core microservice and must not be overwritten',
  overwriteOptionError: 'Configuration option "{{optionName}}" is already defined in core microservice and must not be overwritten',

  startingService: 'Starting "{{name}}" service in background',
  startServiceHelp: 'Run "{{usedCommand}} start {{name}}" to start the service again',

  stoppingService: 'Stopping "{{name}}" service brackground process',
  stopServiceHelp: 'Run "{{usedCommand}} stop {{name}}" to stop the service',

  displayingLogs: 'Displaying logs for "{{name}}" service',
  displayLogsHelp: 'Run "{{usedCommand}} logs {{name}}" to display real-time logs'
}
