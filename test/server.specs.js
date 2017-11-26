const test = require('./test')
const mocks = require('./mocks')

const start = require('../cli/commands/start')
const server = require('../lib/server')

test.describe('Package index', () => {
  let argumentsStub

  test.before(() => {
    test.sinon.stub(server, 'start')
    argumentsStub = new mocks.arguments.Stub()

    require('../server')
  })

  test.after(() => {
    server.start.restore()
    argumentsStub.restore()
  })

  test.it('should call to get options from arguments', () => {
    test.expect(argumentsStub.getOptions).to.have.been.calledWith(start.options)
    test.expect(argumentsStub.getOptions).to.have.been.calledOnce()
  })

  test.it('should call to start the server with arguments options', () => {
    test.expect(server.start).to.have.been.calledWith(mocks.arguments.options)
  })
})
