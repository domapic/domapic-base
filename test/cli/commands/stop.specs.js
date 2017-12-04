const test = require('../../test')
const mocks = require('../../mocks')

const enums = require('../../../lib/enums/log')
const stop = require('../../../cli/commands/stop')

test.describe('CLI stop command', () => {
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

  test.it('should log the stopping process message', (done) => {
    stop.command(mocks.commands.stop.options)
      .then(() => {
        test.expect(logStub.info).to.have.been.calledWith(enums['stopping-server-pm2'])
        done()
      })
  })

  test.it('should create a new Process instance of ./server.js, passing to it the received options', (done) => {
    stop.command(mocks.commands.stop.options)
      .then(() => {
        test.expect(processStub._constructor).to.have.been.calledWithNew()
        test.expect(processStub._constructor.getCall(0).args[0].args).to.eql(mocks.commands.stop.options)
        test.expect(processStub._constructor.getCall(0).args[0].name).to.equal(mocks.commands.stop.options.name)
        done()
      })
  })

  test.it('should call to stop the process', (done) => {
    stop.command(mocks.commands.stop.options)
      .then(() => {
        test.expect(processStub.stop).to.have.been.called()
        done()
      })
  })

  test.it('should log the start commands instructions', (done) => {
    stop.command(mocks.commands.stop.options)
      .then(() => {
        test.expect(logStub.info).to.have.been.calledWith(enums['start-process-instructions'])
        done()
      })
  })
})
