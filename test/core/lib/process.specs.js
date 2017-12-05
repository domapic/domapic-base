const childProcess = require('child_process')
const path = require('path')

const _ = require('lodash')
const pm2 = require('pm2')
const Promise = require('bluebird')

const test = require('../../test')
const mocks = require('../../mocks')

const Process = require('../../../core/lib/process')

test.describe('Core Process', () => {
  const Pm2Stub = function (original, action) {
    const addCallBack = function (options, cb) {
      let callback = cb || options
      if (action.resolve) {
        callback(null, action.resolve)
      } else if (action.reject) {
        callback(action.reject)
      }
    }
    const restore = function () {
      return original
    }
    return {
      addCallBack: addCallBack,
      restore: restore
    }
  }
  let proc,
    pm2Start,
    pm2Connect,
    pm2Stop,
    testCommonMethods

  test.beforeEach(() => {
    pm2Start = new Pm2Stub(pm2.start, {
      resolve: {}
    })
    pm2.start = pm2Start.addCallBack
    test.sinon.spy(pm2, 'start')

    pm2Stop = new Pm2Stub(pm2.stop, {
      resolve: {}
    })
    pm2.stop = pm2Stop.addCallBack
    test.sinon.spy(pm2, 'stop')

    pm2Connect = new Pm2Stub(pm2.connect, {
      resolve: {}
    })
    pm2.connect = pm2Connect.addCallBack
    test.sinon.spy(pm2, 'connect')

    test.sinon.stub(pm2, 'disconnect')
    proc = new Process(mocks.process.options)
  })

  test.afterEach(() => {
    pm2.start.restore()
    pm2.start = pm2Start.restore()

    pm2.connect.restore()
    pm2.connect = pm2Connect.restore()

    pm2.stop.restore()
    pm2.stop = pm2Stop.restore()

    pm2.disconnect.restore()
  })

  test.describe('constructor', () => {
    test.it('should throw an error if no name is provided for the process', () => {
      let error
      const fooOptions = {
        name: ''
      }
      try {
        proc = new Process(fooOptions)
      } catch (err) {
        error = err
      }
      test.expect(error).to.be.an.instanceof(Error)
    })
    test.it('should throw an error if no script is provided for the process', () => {
      let error
      const fooOptions = {
        name: 'fooName',
        script: ''
      }
      try {
        proc = new Process(fooOptions)
      } catch (err) {
        error = err
      }
      test.expect(error).to.be.an.instanceof(Error)
    })
  })

  testCommonMethods = function (methodName) {
    test.it('should return a Promise', () => {
      test.expect(proc[methodName]()).to.be.an.instanceof(Promise)
    })

    test.it('should connect to pm2', (done) => {
      proc[methodName]()
        .then(() => {
          test.expect(pm2.connect).to.have.been.called()
          done()
        })
    })

    test.it('should reject the promise if connection to pm2 fails', (done) => {
      const errorMessage = 'PM2 connection failed'
      pm2.connect.restore()
      pm2.connect = pm2Connect.restore()
      pm2Connect = new Pm2Stub(pm2.connect, {
        reject: new Error(errorMessage)
      })
      pm2.connect = pm2Connect.addCallBack
      test.sinon.spy(pm2, 'connect')

      proc[methodName]()
        .catch((error) => {
          test.expect(error.message).to.equal(errorMessage)
          done()
        })
    })

    test.it('should disconnect from pm2', (done) => {
      proc[methodName]()
        .then(() => {
          test.expect(pm2.disconnect).to.have.been.called()
          done()
        })
    })
  }

  test.describe('start method', () => {
    testCommonMethods('start')

    test.it('should start a ./server.js pm2 process', (done) => {
      proc.start()
        .then(() => {
          test.expect(pm2.start.getCall(0).args[0].script).to.equal(path.resolve(__dirname, '..', '..', '..', 'server.js'))
          done()
        })
    })

    test.it('should pass to pm2 the received options', (done) => {
      const fooOptions = {
        name: 'fooName',
        fooOption2: 'fooValue2'
      }
      proc = new Process(fooOptions)

      proc.start()
        .then(() => {
          _.each(fooOptions, (value, key) => {
            test.expect(pm2.start.getCall(0).args[0][key]).to.equal(value)
          })
          done()
        })
    })

    test.it('should extend default options with received options', (done) => {
      const fooOptions = {
        name: 'fooName',
        script: 'testing'
      }
      proc = new Process(fooOptions)

      proc.start()
        .then(() => {
          _.each(fooOptions, (value, key) => {
            test.expect(pm2.start.getCall(0).args[0].script).to.equal('testing')
          })
          done()
        })
    })

    test.it('should resolve the promise with received process when pm2 process starts sucessfully', (done) => {
      const fooProcess = {
        fooProperty1: 'fooValue1',
        fooProperty2: 'fooValue2'
      }
      pm2.start.restore()
      pm2.start = pm2Start.restore()
      pm2Start = new Pm2Stub(pm2.start, {
        resolve: fooProcess
      })
      pm2.start = pm2Start.addCallBack
      test.sinon.spy(pm2, 'start')

      proc.start()
        .then((result) => {
          test.expect(result).to.eql(fooProcess)
          done()
        })
    })

    test.it('should reject the promise with received error when started pm2 process fails', (done) => {
      const errorMessage = 'This is a foo Error starting pm2 process'
      pm2.start.restore()
      pm2.start = pm2Start.restore()
      pm2Start = new Pm2Stub(pm2.start, {
        reject: new Error(errorMessage)
      })
      pm2.start = pm2Start.addCallBack
      test.sinon.spy(pm2, 'start')

      proc.start()
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(Error)
          test.expect(error.message).to.equal(errorMessage)
          done()
        })
    })

    test.it('should convert received args object to nodejs arguments style array', (done) => {
      const fooOptions = {
        name: 'fooName',
        args: {
          fooOption1: 'fooValue1',
          fooOption2: 'fooValue2',
          fooOption3: undefined,
          fooOption4: false
        }
      }
      proc = new Process(fooOptions)

      proc.start()
        .then(() => {
          test.expect(pm2.start.getCall(0).args[0].args).to.eql([
            '--fooOption1=fooValue1',
            '--fooOption2=fooValue2',
            '--fooOption4=false'
          ])
          done()
        })
    })
  })

  test.describe('stop method', () => {
    testCommonMethods('stop')

    test.it('should reject the promise with received error when stopping pm2 process fails', (done) => {
      const errorMessage = 'This is a foo Error stopping pm2 process'
      pm2.stop.restore()
      pm2.stop = pm2Stop.restore()
      pm2Stop = new Pm2Stub(pm2.stop, {
        reject: new Error(errorMessage)
      })
      pm2.stop = pm2Stop.addCallBack
      test.sinon.spy(pm2, 'stop')

      proc.stop()
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(Error)
          test.expect(error.message).to.equal(errorMessage)
          done()
        })
    })
  })

  test.describe('logs method', () => {
    const spawnStub = {
      stdout: {
        on: (eventName, func) => {
          func('')
        }
      },
      stderr: {
        on: () => {
        }
      },
      on: (eventName, func) => {
        func(0)
      }
    }

    test.beforeEach(() => {
      test.sinon.spy(console, 'log')
      test.sinon.stub(childProcess, 'spawn').returns(spawnStub)
    })

    test.afterEach(() => {
      childProcess.spawn.restore()
      console.log.restore()
    })

    testCommonMethods('logs')

    test.it('should create a spawn process of pm2 logs, passing to it the name of the process', (done) => {
      proc.logs()
        .then(() => {
          test.expect(childProcess.spawn.getCall(0).args[0]).to.equal(path.resolve(__dirname, '..', '..', '..', 'node_modules', '.bin', 'pm2'))
          test.expect(childProcess.spawn.getCall(0).args[1][0]).to.equal('logs')
          test.expect(childProcess.spawn.getCall(0).args[1][1]).to.equal(mocks.process.options.name)
          done()
        })
    })

    test.it('should log the spawned process stdout', (done) => {
      const fooStdout = 'foo stdout'
      let stub = _.clone(spawnStub)
      stub.stdout.on = function (eventName, func) {
        func(fooStdout)
      }
      childProcess.spawn.restore()
      test.sinon.stub(childProcess, 'spawn').returns(stub)
      proc.logs()
        .then(() => {
          test.expect(console.log).to.have.been.calledWith(fooStdout)
          done()
        })
    })

    test.it('should not log the spawned process empty stdouts', (done) => {
      let stub = _.clone(spawnStub)
      stub.stdout.on = function (eventName, func) {
        func('    ')
      }
      childProcess.spawn.restore()
      test.sinon.stub(childProcess, 'spawn').returns(stub)

      proc.logs()
        .then(() => {
          test.expect(console.log).not.to.have.been.called()
          done()
        })
    })

    test.it('should reject the promise if the spawned process is closed with error code', (done) => {
      let stub = _.clone(spawnStub)
      stub.on = function (eventName, func) {
        func(1)
      }
      childProcess.spawn.restore()
      test.sinon.stub(childProcess, 'spawn').returns(stub)

      proc.logs()
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(Error)
          done()
        })
    })

    test.it('should reject the promise if the spawned process stderr is called', (done) => {
      const errorMessage = 'This is a foo error message'
      let stub = _.clone(spawnStub)
      stub.stderr.on = function (eventName, func) {
        func(errorMessage)
      }
      childProcess.spawn.restore()
      test.sinon.stub(childProcess, 'spawn').returns(stub)

      proc.logs()
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(Error)
          test.expect(error.message).to.equal(errorMessage)
          done()
        })
    })
  })
})
