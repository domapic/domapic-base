const Promise = require('bluebird')

const test = require('../../index')
const mocks = require('../../mocks')

const stop = require('../../../lib/cli/stop')

test.describe('Cli Commands -> stop', () => {
  let cliMethods

  test.beforeEach(() => {
    cliMethods = mocks.core.cliMethodsStub()
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
})
