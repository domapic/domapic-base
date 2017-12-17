
const _ = require('lodash')
const Promise = require('bluebird')
const tracer = require('tracer')

const test = require('../../../index')
const mocks = require('../../../mocks')

const Errors = require('../../../../lib/bases/core/Errors')
const Tracer = require('../../../../lib/bases/core/Tracer')

test.describe('Bases -> Core -> Tracer', () => {
  const methodNames = ['log', 'trace', 'debug', 'info', 'warn', 'error']
  const errors = new Errors()
  const fooLogsPath = 'fooPath/logs'
  let config
  let paths
  let coreTracer
  let tracerConsole
  let tracerFile
  let tracerLogsSpies = {}
  let tracerFilesSpies = {}
  let preprocess
  let preprocessData

  test.beforeEach(() => {
    preprocessData = {}
    _.each(methodNames, (methodName) => {
      tracerFilesSpies[methodName] = test.sinon.spy()
      tracerLogsSpies[methodName] = test.sinon.spy((toTrace) => {
        preprocessData = {
          title: methodName,
          args: [toTrace]
        }
        preprocess(preprocessData)
      })
    })
    tracerFile = test.sinon.spy((options) => {
      const methods = {}
      _.each(methodNames, (methodName) => {
        methods[methodName] = tracerFilesSpies[methodName]
      })
      return methods
    })
    tracerConsole = test.sinon.spy((options) => {
      const methods = {}
      preprocess = options.preprocess
      _.each(methodNames, (methodName) => {
        methods[methodName] = tracerLogsSpies[methodName]
      })
      return methods
    })
    test.sinon.stub(tracer, 'console').callsFake(tracerConsole)
    test.sinon.stub(tracer, 'dailyfile').callsFake(tracerFile)
    config = {
      get: test.sinon.stub().usingPromise(Promise).resolves(mocks.config.getResult)
    }
    paths = {
      ensureDir: test.sinon.stub().usingPromise(Promise).resolves(fooLogsPath)
    }
    coreTracer = new Tracer(config, paths, errors)
  })

  test.afterEach(() => {
    tracer.console.restore()
    tracer.dailyfile.restore()
  })

  _.each(methodNames, (methodName) => {
    test.describe(methodName, () => {
      test.it('should return a Promise', (done) => {
        let response = coreTracer[methodName]()
          .then(() => {
            test.expect(response).to.be.an.instanceof(Promise)
            done()
          })
      })

      test.it('should ensure that logs folder exists', (done) => {
        coreTracer[methodName]()
          .then(() => {
            test.expect(paths.ensureDir).to.have.been.calledWith('logs')
            done()
          })
      })

      test.it('should call to get config', (done) => {
        coreTracer[methodName]()
          .then(() => {
            test.expect(config.get).to.have.been.called()
            done()
          })
      })

      test.it('should initialize the tracer console', (done) => {
        coreTracer[methodName]()
          .then(() => {
            test.expect(tracer.console).to.have.been.called()
            done()
          })
      })

      test.it('should initialize the tracer dailyfile with options from config and paths', (done) => {
        coreTracer[methodName]()
          .then(() => {
            test.expect(tracer.dailyfile.getCall(0).args[0].level).to.equal(mocks.config.getResult.logLevel)
            test.expect(tracer.dailyfile.getCall(0).args[0].root).to.equal(fooLogsPath)
            test.expect(tracer.dailyfile.getCall(0).args[0].allLogsFileName).to.equal(mocks.config.getResult.name)
            done()
          })
      })

      test.it('should initialize config and tracers only first time is called', (done) => {
        coreTracer[methodName]()
          .then(() => {
            coreTracer[methodName]()
              .then(() => {
                test.expect(paths.ensureDir).to.have.been.calledOnce()
                test.expect(config.get).to.have.been.calledOnce()
                test.expect(tracer.console).to.have.been.calledOnce()
                test.expect(tracer.dailyfile).to.have.been.calledOnce()
                done()
              })
          })
      })

      test.it('should set tracer trace options at high level if logLevel option is lower than "debug"', (done) => {
        config = {
          get: test.sinon.stub().usingPromise(Promise).resolves(_.extend(
            mocks.config.getResult,
            {logLevel: 'log'}
          ))
        }
        coreTracer = new Tracer(config, paths, errors)
        coreTracer[methodName]()
          .then(() => {
            test.expect(tracer.dailyfile.getCall(0).args[0].inspectOpt.showHidden).to.equal(true)
            test.expect(tracer.dailyfile.getCall(0).args[0].inspectOpt.depth).to.equal(10)
            done()
          })
      })

      if (methodName === 'error') {
        test.it('should add the error stack to the data to be traced', (done) => {
          let error = new Error('fooError')
          coreTracer[methodName](error)
            .then(() => {
              test.expect(preprocessData.stack).to.equal(error.stack)
              test.expect(preprocessData.args[0]).to.equal(error.toString())
              done()
            })
        })
      }
    })
  })
})
