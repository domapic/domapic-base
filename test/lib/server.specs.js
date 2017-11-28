const test = require('../test')
const mocks = require('../mocks')

const enums = require('../../lib/enums/log')
const server = require('../../lib/server')

test.describe('Server', () => {
  test.describe('start', () => {
    let logStub

    test.beforeEach(() => {
      logStub = new mocks.log.Stub()
    })

    test.afterEach(() => {
      logStub.restore()
    })

    test.it('should create a new Log instance from core', (done) => {
      server.start(mocks.arguments.options)
        .then(() => {
          test.expect(logStub._constructor).to.have.been.calledWithNew()
          done()
        })
    })

    test.it('should log the start message', (done) => {
      server.start(mocks.arguments.options)
        .then(() => {
          test.expect(logStub.info).to.have.been.calledWith(enums['starting-server'])
          done()
        })
    })

    test.it('should log the options received', (done) => {
      server.start(mocks.arguments.options)
        .then(() => {
          test.expect(logStub.data).to.have.been.calledWith(mocks.arguments.options)
          done()
        })
    })
  })
})
