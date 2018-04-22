
const childProcess = require('child_process')
const path = require('path')

const Promise = require('bluebird')
const pm2 = require('pm2')

const test = require('narval')
const mocks = require('../../mocks')

const Process = require('../../../../lib/bases/Process')

test.describe('Bases -> Process', () => {
  const fooFilePath = '/logs/fooName.pm2.log'
  const fooScriptPath = '/fooScript.js'
  let stubCore
  let pm2Connect
  let pm2ConnectResolver
  let pm2ConnectRejecter
  let pm2Resolver
  let pm2Rejecter
  let pm2Process

  test.beforeEach(() => {
    stubCore = new mocks.core.Stub()
    pm2Process = new Process({
      script: fooScriptPath,
      name: mocks.arguments.options.name
    }, stubCore)

    pm2ConnectResolver = test.sinon.spy(function (cb) {
      cb(null)
    })
    pm2ConnectRejecter = test.sinon.spy(function (cb) {
      cb(new Error(mocks.process.pm2ConnectError))
    })
    pm2Resolver = test.sinon.spy(function (pm2Options, cb) {
      cb(null, mocks.process.pm2Process)
    })
    pm2Rejecter = test.sinon.spy(function (pm2Options, cb) {
      cb(new Error(mocks.process.pm2Error))
    })
    pm2Connect = test.sinon.stub(pm2, 'connect').callsFake(pm2ConnectResolver)
    test.sinon.stub(pm2, 'disconnect')
  })

  test.afterEach(() => {
    pm2.connect.restore()
    pm2.disconnect.restore()
  })

  const commonTests = function (method) {
    test.it('should return a Promise', () => {
      return test.expect(pm2Process[method]()).to.be.an.instanceof(Promise)
    })

    test.it('should connect to PM2', () => {
      return pm2Process[method]()
        .then(() => {
          return test.expect(pm2.connect).to.have.been.called()
        })
    })

    test.it('should reject the promise if connect to PM2 fails', () => {
      pm2Connect.callsFake(pm2ConnectRejecter)
      return pm2Process[method]()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(Error)
        })
    })

    test.it('should disconnect from PM2', () => {
      return pm2Process[method]()
        .then(() => {
          return test.expect(pm2.disconnect).to.have.been.called()
        })
    })

    test.it('should ensure that logs paths exists', () => {
      return pm2Process[method]()
        .then(() => {
          return test.expect(stubCore.paths.ensureFile.getCall(0).args[0].indexOf(mocks.arguments.options.name)).to.be.above(-1)
        })
    })

    test.it('should not ensure that logs paths exists more than once', () => {
      return pm2Process[method]()
        .then(() => {
          return pm2Process[method]()
            .then(() => {
              return test.expect(stubCore.paths.ensureFile).to.have.been.calledOnce()
            })
        })
    })

    test.it('should reject the promise if no name was provided for process', () => {
      pm2Process = new Process({}, stubCore)
      return pm2Process[method]()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(stubCore.errors.BadData)
        })
    })

    test.it('should reject the promise if no script path was provided for process', () => {
      pm2Process = new Process({
        name: mocks.arguments.options.name
      }, stubCore)
      return pm2Process[method]()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(stubCore.errors.BadData)
        })
    })
  }

  test.describe('start', () => {
    let pm2Start

    test.beforeEach(() => {
      pm2Start = test.sinon.stub(pm2, 'start').callsFake(pm2Resolver)
    })

    test.afterEach(() => {
      pm2.start.restore()
    })

    commonTests('start')

    test.it('should add received arguments to default pm2 options', () => {
      const fooArguments = ['--testing', '--testing2']
      return pm2Process.start(fooArguments)
        .then(() => {
          return test.expect(pm2Start.getCall(0).args[0].args).to.deep.equal(fooArguments)
        })
    })

    test.it('should convert string arguments to array', () => {
      const fooArguments = '--testing'
      return pm2Process.start(fooArguments)
        .then(() => {
          return test.expect(pm2Start.getCall(0).args[0].args).to.deep.equal([fooArguments])
        })
    })

    test.it('should convert object arguments to array', () => {
      const fooArguments = {
        testing: true,
        testing2: 'fooValue',
        testing3: undefined,
        testing4: ['foo1', 'foo2'],
        testing5: []
      }
      return pm2Process.start(fooArguments)
        .then(() => {
          return test.expect(pm2Start.getCall(0).args[0].args).to.deep.equal(['--testing=true', '--testing2=fooValue', '--testing4=foo1', '--testing4=foo2', '--testing5'])
        })
    })

    test.it('should start the PM2 process with logs pointing to log file path', () => {
      stubCore.paths.ensureFile.resolves(fooFilePath)
      return pm2Process.start()
        .then(() => {
          return Promise.all([
            test.expect(pm2Start.getCall(0).args[0].output).to.equal(fooFilePath),
            test.expect(pm2Start.getCall(0).args[0].error).to.equal(fooFilePath)
          ])
        })
    })

    test.it('should resolve the promise with the PM2 process', () => {
      return pm2Process.start()
        .then((pm2Proc) => {
          return test.expect(pm2Proc).to.deep.equal(mocks.process.pm2Process)
        })
    })

    test.it('should reject the promise if starting PM2 process fails', () => {
      pm2Start.callsFake(pm2Rejecter)
      return pm2Process.start()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(stubCore.errors.ChildProcess)
        })
    })
  })

  test.describe('stop', () => {
    let pm2Stop

    test.beforeEach(() => {
      pm2Stop = test.sinon.stub(pm2, 'stop').callsFake(pm2Resolver)
    })

    test.afterEach(() => {
      pm2.stop.restore()
    })

    commonTests('stop')

    test.it('should call to stop pm2 passing the name of the process', () => {
      return pm2Process.stop()
        .then(() => {
          return test.expect(pm2Stop.getCall(0).args[0]).to.equal(mocks.arguments.options.name)
        })
    })

    test.it('should resolve the promise with the pm2 process data', () => {
      return pm2Process.stop()
        .then((result) => {
          return test.expect(result).to.deep.equal(mocks.process.pm2Process)
        })
    })

    test.it('should reject the promise if pm2 stop fails', () => {
      pm2Stop.callsFake(pm2Rejecter)
      return pm2Process.stop()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(stubCore.errors.ChildProcess)
        })
    })
  })

  test.describe('logs', () => {
    const spawnStub = mocks.process.processSpawn()

    test.beforeEach(() => {
      spawnStub.callsFake('on', 0)
      test.sinon.stub(childProcess, 'spawn').returns(spawnStub)
    })

    test.afterEach(() => {
      childProcess.spawn.restore()
    })

    commonTests('logs')

    test.it('should create a spawn process of pm2 logs, passing to it the name of the process', () => {
      return pm2Process.logs()
        .then(() => {
          return Promise.all([
            test.expect(childProcess.spawn.getCall(0).args[0]).to.equal(path.resolve(__dirname, '..', '..', '..', '..', 'node_modules', '.bin', 'pm2')),
            test.expect(childProcess.spawn.getCall(0).args[1][0]).to.equal('logs'),
            test.expect(childProcess.spawn.getCall(0).args[1][1]).to.equal(mocks.arguments.options.name)
          ])
        })
    })

    test.it('should add the lines options to the spawned process if received', () => {
      const fooLines = 453
      return pm2Process.logs({
        lines: fooLines
      })
        .then(() => {
          return test.expect(childProcess.spawn.getCall(0).args[1].indexOf('--lines=' + fooLines)).to.be.above(-1)
        })
    })

    test.it('should log the spawned process stdout', () => {
      const fooLog = 'This is a foo process log'
      spawnStub.callsFake('stdout', fooLog)
      test.sinon.spy(console, 'log')
      return pm2Process.logs()
        .then(() => {
          return test.expect(console.log).to.have.been.calledWith(fooLog)
        })
        .finally(() => {
          console.log.restore()
        })
    })

    test.it('should not log the spawned process empty stdout', () => {
      const fooLog = ''
      spawnStub.callsFake('stdout', fooLog)
      test.sinon.spy(console, 'log')
      return pm2Process.logs()
        .then(() => {
          return test.expect(console.log).not.to.have.been.called()
        })
        .finally(() => {
          console.log.restore()
        })
    })

    test.it('should reject the promise if the spawned process is closed with error code', () => {
      spawnStub.callsFake('on', 1)
      return pm2Process.logs()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(stubCore.errors.ChildProcess)
        })
    })

    test.it('should reject the promise if the spawned process stderr is called', () => {
      spawnStub.callsFake('stderr', 'error')
      return pm2Process.logs()
        .catch((err) => {
          return test.expect(err).to.be.an.instanceof(stubCore.errors.ChildProcess)
        })
    })
  })
})
