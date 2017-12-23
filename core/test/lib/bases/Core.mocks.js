
const Promise = require('bluebird')

const test = require('../../index')

const configMocks = require('./core/Config.mocks')

const Stub = function () {
  return {
    tracer: {
      debug: test.sinon.stub().usingPromise(Promise).resolves(),
      info: test.sinon.stub().usingPromise(Promise).resolves()
    },
    config: {
      get: test.sinon.stub().usingPromise(Promise).resolves(configMocks.getResult)
    }
  }
}

module.exports = {
  Stub: Stub
}
