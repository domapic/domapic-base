const test = require('../../test')

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
    test.it('should console the received text', () => {
      let text = 'Testing log.info'
      log.info(text)
        .then(() => {
          test.expect(console.log).to.have.been.calledWith(text)
        })
    })
  })
})
