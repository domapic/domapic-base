'use strict'

// const Core = require('../../core/index')

const start = function (options) {
  // const core = new Core(options)
  console.log('starting')
  console.log(options)
}

module.exports = {
  describe: '',
  cli: 'start [name]',
  options: {
    port: {
      type: 'number',
      alias: ['p'],
      describe: 'Listening port number for the controller server'
    },
    name: {
      type: 'string',
      alias: ['n'],
      describe: 'Server instance unique name'
    }
  },
  command: start
}
