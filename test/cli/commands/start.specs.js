const test = require('../../test')
const mocks = require('../../mocks')

const enums = require('../../../lib/enums/log')
const start = require('../../../cli/commands/start')

test.describe('CLI start command', () => {
  test.describe('start', () => {
    let logStub

    test.beforeEach(() => {
      logStub = new mocks.log.Stub()
    })

    test.afterEach(() => {
      logStub.restore()
    })

    test.it('should create a new Log instance from core', () => {
      start.command(mocks.arguments.options)
      test.expect(logStub._constructor).to.have.been.calledWithNew()
    })

    test.it('should log the start message', () => {
      start.command(mocks.arguments.options)
      test.expect(logStub.info).to.have.been.calledWith(enums['starting-server-pm2'])
    })

    test.it('should log the options received', () => {
      start.command(mocks.arguments.options)
      test.expect(logStub.data).to.have.been.calledWith(mocks.arguments.options)
    })
  })
})
