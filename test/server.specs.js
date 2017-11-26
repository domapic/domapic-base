const test = require('./test')
const mocks = require('./mocks')

const core = require('../core')
const server = require('../lib/server')
const start = require('../cli/commands/start')

test.describe('Package index', () => {
  test.before(() => {
    test.sinon.stub(server, 'start')
    test.sinon.stub(core.arguments, 'getOptions').returns(mocks.arguments.options)
    require('../server.js')
  })

  test.after(() => {
    server.start.restore()
    core.arguments.getOptions.restore()
  })

  test.it('should call to get options from arguments', () => {
    test.expect(core.arguments.getOptions).to.have.been.calledWith(start.options)
    test.expect(core.arguments.getOptions).to.have.been.calledOnce()
  })

  test.it('should call to start the server with arguments options', () => {
    test.expect(server.start).to.have.been.calledWith(mocks.arguments.options)
    test.expect(core.arguments.getOptions).to.have.been.calledOnce()
  })
})
