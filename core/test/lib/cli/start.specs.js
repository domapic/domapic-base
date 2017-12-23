const Promise = require('bluebird')

const test = require('../../index')
const mocks = require('../../mocks')

const start = require('../../../lib/cli/start')

test.describe('Cli Commands -> start', () => {
  let cliMethods

  test.beforeEach(() => {
    cliMethods = mocks.core.cliMethodsStub()
  })

  test.it('should return a Promise', (done) => {
    let response = start.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(response).to.be.an.instanceof(Promise)
        done()
      })
  })

  test.it('should display info about the command execution', (done) => {
    start.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.tracer.info).to.have.been.called()
        done()
      })
  })

  test.it('should call to start the process', (done) => {
    start.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.process.start).to.have.been.calledWith(mocks.config.getResult)
        done()
      })
  })

  test.it('should display the received configuration in debug mode', (done) => {
    start.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.tracer.group.getCall(0).args[0][2].debug).to.deep.equal(mocks.config.getResult)
        done()
      })
  })
})
