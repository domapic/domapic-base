const pm2 = require('pm2')
const Promise = require('bluebird')

const test = require('../../test')
const mocks = require('../../mocks')

const Process = require('../../../core/lib/process')

test.describe('Core Process', () => {
  test.describe('constructor', () => {
    // TODO, test invalid options
  })
  test.describe('start method', () => {
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
      pm2Stop

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

    // TODO, common tests
    test.it('should return a Promise', () => {
      test.expect(proc.start()).to.be.an.instanceof(Promise)
    })

    test.it('should connect to pm2', (done) => {
      proc.start()
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

      proc.start()
        .catch((error) => {
          test.expect(error.message).to.equal(errorMessage)
          done()
        })
    })

    test.it('should disconnect from pm2', (done) => {
      proc.start()
        .then(() => {
          test.expect(pm2.disconnect).to.have.been.called()
          done()
        })
    })

    // End of common tests

    test.it('should start a ./server.js pm2 process', () => {
    })

    test.it('should pass to pm2 the received options', () => {
    })

    test.it('should extend default options with received options', () => {
    })

    test.it('should resolve the promise with received process when pm2 starts sucessfully', () => {
    })

    test.it('should reject the promise with received error when pm2 process fails', () => {
    })
  })
})
