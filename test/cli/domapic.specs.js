const test = require('../test')
const mocks = require('../mocks')

test.describe('Domapic CLI index', () => {
  let argumentsStub

  test.before(() => {
    argumentsStub = new mocks.arguments.Stub()
    require('../../cli/index')
  })

  test.after(() => {
    argumentsStub.restore()
  })

  test.it('should register commands in core arguments handler', () => {
    test.expect(argumentsStub.registerCommands).to.have.been.calledWith(mocks.cli.commands)
  })
})
