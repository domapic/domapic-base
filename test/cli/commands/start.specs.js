const test = require('../../test')
const mocks = require('../../mocks')

const enums = require('../../../lib/enums/log')
const start = require('../../../cli/commands/start')

test.describe('CLI start command', () => {
  test.describe('start', () => {
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
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(processStub._constructor).to.have.been.calledWithNew()
          test.expect(processStub._constructor.getCall(0).args[0].name).to.equal(mocks.arguments.options.name)
          done()
        })
    })

    test.it('should pass to the new process the received options as arguments', (done) => {
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(processStub._constructor).to.have.been.calledWithNew()
          test.expect(processStub._constructor.getCall(0).args[0].args).to.eql(mocks.arguments.options)
          done()
        })
    })

    test.it('should assing the name received in options to the new process', (done) => {
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(processStub._constructor.getCall(0).args[0].name).to.equal(mocks.arguments.options.name)
          done()
        })
    })

    test.it('should log the start message', (done) => {
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(logStub.info).to.have.been.calledWith(enums['starting-server-pm2'])
          done()
        })
    })

    test.it('should start the new process', (done) => {
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(processStub.start).to.have.been.called()
          done()
        })
    })

    test.it('should log the stop process instructions message', (done) => {
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(logStub.info).to.have.been.calledWith(enums['stop-process-instructions'])
          done()
        })
    })

    test.it('should log the options received', (done) => {
      start.command(mocks.arguments.options)
        .then(() => {
          test.expect(logStub.data).to.have.been.calledWith(mocks.arguments.options)
          done()
        })
    })
  })
})
