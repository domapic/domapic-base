
const Promise = require('bluebird')

const test = require('../../index')

const utils = require('../../../lib/utils')
const configMocks = require('./core/Config.mocks')
const processMocks = require('./Process.mocks')

const Stub = function () {
  return {
    config: {
      get: test.sinon.stub().usingPromise(Promise).resolves(configMocks.getResult)
    },
    process: {
      start: test.sinon.stub().usingPromise(Promise).resolves(processMocks),
      stop: test.sinon.stub().usingPromise(Promise).resolves(processMocks),
      logs: test.sinon.stub().usingPromise(Promise).resolves()
    },
    tracer: {
      debug: test.sinon.stub().usingPromise(Promise).resolves(),
      group: test.sinon.stub().usingPromise(Promise).resolves(),
      info: test.sinon.stub().usingPromise(Promise).resolves(),
      log: test.sinon.stub().usingPromise(Promise).resolves()
    },
    utils: {
      templates: {
        compile: test.sinon.stub().callsFake(utils.templates.compile)
      }
    }
  }
}

const cliMethodsStub = function () {
  const stubCore = new Stub()

  return {
    process: stubCore.process,
    config: stubCore.config,
    tracer: stubCore.tracer,
    utils: stubCore.utils
  }
}

module.exports = {
  Stub: Stub,
  cliMethodsStub: cliMethodsStub
}
