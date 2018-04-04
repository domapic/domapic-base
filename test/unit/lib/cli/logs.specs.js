
const Promise = require('bluebird')

const test = require('narval')
const mocks = require('../../mocks')

const logs = require('../../../../lib/cli/logs')

test.describe('Cli Commands -> logs', () => {
  let cliMethods

  test.beforeEach(() => {
    cliMethods = mocks.core.cliMethodsStub()
  })

  test.it('should return a Promise', (done) => {
    let response = logs.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(response).to.be.an.instanceof(Promise)
        done()
      })
  })

  test.it('should display info about the command execution', (done) => {
    logs.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.tracer.info).to.have.been.called()
        done()
      })
  })

  test.it('should call to display process logs', (done) => {
    logs.command(mocks.config.getResult, cliMethods)
      .then(() => {
        test.expect(cliMethods.process.logs).to.have.been.called()
        done()
      })
  })
})
