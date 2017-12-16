/* const test = require('../../test')
const mocks = require('../../mocks')

const enums = require('../../../lib/enums/log')
const logs = require('../../../cli/commands/logs')

test.describe('CLI logs command', () => {
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

  test.it('should log the flushing logs message', (done) => {
    logs.command(mocks.commands.logs.options)
      .then(() => {
        test.expect(logStub.info).to.have.been.calledWith(enums['flushing-pm2-logs'])
        done()
      })
  })

  test.it('should create a new Process instance of ./server.js, passing to it the received options', (done) => {
    logs.command(mocks.commands.logs.options)
      .then(() => {
        test.expect(processStub._constructor).to.have.been.calledWithNew()
        test.expect(processStub._constructor.getCall(0).args[0].args).to.eql(mocks.commands.logs.options)
        test.expect(processStub._constructor.getCall(0).args[0].name).to.equal(mocks.commands.logs.options.name)
        done()
      })
  })

  test.it('should call to flush the process logs', (done) => {
    logs.command(mocks.commands.logs.options)
      .then(() => {
        test.expect(processStub.logs).to.have.been.called()
        done()
      })
  })
})
*/
