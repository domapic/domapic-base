const test = require('../../test')
const Promise = require('bluebird')

const Log = require('../../../core/lib/log')

test.describe('Core Log', () => {
  let log

  test.beforeEach(() => {
    test.sinon.spy(console, 'log')
    log = new Log()
  })

  test.afterEach(() => {
    console.log.restore()
  })

  test.describe('Data', () => {
    test.it('should return a Promise', () => {
      test.expect(log.data('')).to.be.an.instanceof(Promise)
    })

    test.it('should console the received text', (done) => {
      let text = 'Testing log.data'
      log.data(text)
        .then(() => {
          test.expect(console.log).to.have.been.calledWith(text)
          done()
        })
    })
  })

  test.describe('Info', () => {
    test.it('should return a Promise', () => {
      test.expect(log.info('')).to.be.an.instanceof(Promise)
    })
    test.it('should console the received text', () => {
      let text = 'Testing log.info'
      log.info(text)
        .then(() => {
          test.expect(console.log).to.have.been.calledWith(text)
        })
    })
  })
})
