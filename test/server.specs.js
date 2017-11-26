const test = require('./test')

const core = require('../core')
const server = require('../lib/server')
const start = require('../cli/commands/start')

test.describe('Package index', () => {
  const fooOptions = {
    name: 'fooName',
    port: 34000
  }

  test.before(() => {
    test.sinon.stub(server, 'start')
    test.sinon.stub(core.arguments, 'getOptions').returns(fooOptions)
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
    test.expect(server.start).to.have.been.calledWith(fooOptions)
    test.expect(core.arguments.getOptions).to.have.been.calledOnce()
  })
})
