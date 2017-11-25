const test = require('./test')

const start = require('../cli/commands/start')
const args = require('../lib/utils/arguments')

test.describe('Start server through package index', () => {
  const fooOptions = {
    name: 'fooName',
    port: 34000
  }

  test.before(() => {
    test.sinon.stub(start, 'command')
    test.sinon.stub(args, 'getOptions').returns(fooOptions)
    require('../server.js')
  })

  test.after(() => {
    start.command.restore()
    args.getOptions.restore()
  })

  test.it('should call to get the start command options from arguments', () => {
    test.expect(args.getOptions).to.have.been.calledWith(start.options)
    test.expect(args.getOptions).to.have.been.calledOnce()
  })

  test.it('should start the server with arguments options', () => {
    test.expect(start.command).to.have.been.calledWith(fooOptions)
    test.expect(args.getOptions).to.have.been.calledOnce()
  })
})
