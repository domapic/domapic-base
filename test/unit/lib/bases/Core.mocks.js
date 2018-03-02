
const Promise = require('bluebird')

const test = require('../../index')

const utils = require('../../../../lib/utils')
const configMocks = require('./core/Config.mocks')
const processMocks = require('./Process.mocks')

const Stub = function () {
  const FooErrorConstructor = function (message, stack, extraData) {
    this.message = message
    this.name = 'Error'
    this.typeof = 'fooType'
    this.isDomapic = true
    this.stack = stack || (new Error()).stack
    this.extraData = extraData
  }

  FooErrorConstructor.prototype = Object.create(Error.prototype)
  FooErrorConstructor.prototype.constructor = FooErrorConstructor

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
      log: test.sinon.stub().usingPromise(Promise).resolves(),
      error: test.sinon.stub().usingPromise(Promise).resolves()
    },
    utils: {
      templates: {
        compile: test.sinon.stub().callsFake(utils.templates.compile),
        compiled: utils.templates.compiled
      },
      cli: {
        usedCommand: test.sinon.stub().callsFake(utils.cli.usedCommand)
      },
      services: {
        serviceType: test.sinon.stub().callsFake(utils.services.servicetype)
      }
    },
    errors: {
      isControlled: test.sinon.stub(),
      FromCode: test.sinon.stub(),
      toHTML: test.sinon.stub(),
      BadImplementation: FooErrorConstructor,
      ChildProcess: FooErrorConstructor,
      FileSystem: FooErrorConstructor,
      NotImplemented: FooErrorConstructor,
      BadData: FooErrorConstructor,
      TimeOut: FooErrorConstructor,
      ClienTimeOut: FooErrorConstructor,
      Forbidden: FooErrorConstructor,
      Unauthorized: FooErrorConstructor,
      NotFound: FooErrorConstructor,
      Conflict: FooErrorConstructor,
      ServerUnavailable: FooErrorConstructor,
      MethodNotAllowed: FooErrorConstructor
    },
    paths: {
      ensureFile: test.sinon.stub().usingPromise(Promise).resolves()
    }
  }
}

const cliMethodsStub = function () {
  const stubCore = new Stub()

  return {
    process: stubCore.process,
    config: stubCore.config,
    tracer: stubCore.tracer,
    utils: stubCore.utils,
    errors: stubCore.errors
  }
}

module.exports = {
  Stub: Stub,
  cliMethodsStub: cliMethodsStub
}
