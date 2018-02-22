
const Promise = require('bluebird')

const test = require('../../index')
const mocks = require('../../mocks')

const stop = require('../../../lib/cli/stop')

test.describe('Cli Commands -> stop', () => {
  let cliMethods

  test.beforeEach(() => {
    cliMethods = mocks.core.cliMethodsStub()
    cliMethods.process.stop.resolves(mocks.process)
  })

  test.it('should return a Promise', (done) => {
    let response = stop.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(response).to.be.an.instanceof(Promise)
        done()
      })
  })

  test.it('should display info about the command execution', (done) => {
    stop.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.tracer.info).to.have.been.called()
        done()
      })
  })

  test.it('should call to stop the process', (done) => {
    stop.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.process.stop).to.have.been.called()
        done()
      })
  })

  test.it('should trace the error if stopping the process returns a controlled error', (done) => {
    const errorMessage = 'This is a foo controlled error'
    const controlledError = new cliMethods.errors.BadData(errorMessage)
    cliMethods.process.stop.rejects(controlledError)
    cliMethods.errors.isControlled.returns(true)
    stop.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.tracer.error).to.have.been.calledWith(errorMessage)
        done()
      })
  })

  test.it('should reject the promise with the received error if stopping the process returns an unexpected error', (done) => {
    const errorMessage = 'This is a foo controlled error'
    const unexpectedError = new Error(errorMessage)
    cliMethods.process.stop.rejects(unexpectedError)
    stop.command(mocks.config.getResult, cliMethods)
      .catch((error) => {
        test.expect(error.message).to.equal(errorMessage)
        done()
      })
  })
})
