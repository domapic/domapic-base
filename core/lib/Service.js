'use strict'

const Arguments = require('./bases/Arguments')
const Client = require('./bases/Client')
const Core = require('./bases/Core')
const Server = require('./bases/Server')

const serviceArguments = require('./arguments/service')

const Service = function () {
  const options = new Arguments(serviceArguments).getOptions()

  const core = new Core(options)

  const server = new Server(core)
  const client = new Client(core)

  return {
    server: server,
    client: client
  }
}

module.exports = Service
