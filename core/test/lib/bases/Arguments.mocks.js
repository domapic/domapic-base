
const _ = require('lodash')
const Promise = require('bluebird')

const test = require('../../index')

const getResult = {
  options: {
    color: false,
    name: 'testing',
    logLevel: 'info',
    path: undefined,
    port: 8090
  },
  defaults: {
    color: true,
    logLevel: 'info',
    port: 8090
  },
  explicit: {
    name: 'testing'
  }
}

const cliCommandsMethods = function () {
  const config = {
    get: test.sinon.stub().usingPromise(Promise).resolves(_.extend(
      {},
      getResult.defaults,
      getResult.explicit
    ))
  }
  const tracer = {
    error: test.sinon.stub().usingPromise(Promise).resolves()
  }
  return {
    config: config,
    tracer: tracer,
    get: () => {
      return Promise.resolve({
        config: config,
        tracer: tracer
      })
    }
  }
}

const options = {
  name: 'fooService',
  path: '/fooPath',
  logLevel: 'debug'
}

const terminalWidth = 500

module.exports = {
  options: options,
  getResult: getResult,
  terminalWidth: terminalWidth,
  cliCommandsMethods: cliCommandsMethods
}
