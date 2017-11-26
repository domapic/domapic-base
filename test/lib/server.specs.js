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

    test.it('should create a new Log instance from core', () => {
      server.start(mocks.arguments.options)
      test.expect(logStub._constructor).to.have.been.calledWithNew()
    })

    test.it('should log the start message', () => {
      server.start(mocks.arguments.options)
      test.expect(logStub.info).to.have.been.calledWith(enums['starting-server'])
    })

    test.it('should log the options received', () => {
      server.start(mocks.arguments.options)
      test.expect(logStub.data).to.have.been.calledWith(mocks.arguments.options)
    })
  })
})
