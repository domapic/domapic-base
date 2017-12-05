const test = require('../../test')
const mocks = require('../../mocks')

const enums = require('../../../lib/enums/log')
const start = require('../../../cli/commands/start')

test.describe('CLI start command', () => {
  let logStub,
    processStub

  test.beforeEach(() => {
    logStub = new mocks.log.Stub()
    processStub = new mocks.process.Stub()
  })

  test.afterEach(() => {
    logStub.restore()
    processStub.restore()
  })

  test.it('should create a new Process instance of ./server.js, passing to it the received options', (done) => {
    start.command(mocks.commands.start.options)
      .then(() => {
        test.expect(processStub._constructor).to.have.been.calledWithNew()
        test.expect(processStub._constructor.getCall(0).args[0].args).to.eql(mocks.commands.start.options)
        test.expect(processStub._constructor.getCall(0).args[0].name).to.equal(mocks.commands.start.options.name)
        done()
      })
  })

  test.it('should log the start message', (done) => {
    start.command(mocks.commands.start.options)
      .then(() => {
        test.expect(logStub.info).to.have.been.calledWith(enums['starting-server-pm2'])
        done()
      })
  })

  test.it('should start the new process', (done) => {
    start.command(mocks.commands.start.options)
      .then(() => {
        test.expect(processStub.start).to.have.been.called()
        done()
      })
  })

  test.it('should log the stop process instructions message', (done) => {
    start.command(mocks.commands.start.options)
      .then(() => {
        test.expect(logStub.info).to.have.been.calledWith(enums['stop-process-instructions'])
        done()
      })
  })

  test.it('should log the options received', (done) => {
    start.command(mocks.commands.start.options)
      .then(() => {
        test.expect(logStub.data).to.have.been.calledWith(mocks.commands.start.options)
        done()
      })
  })
})
