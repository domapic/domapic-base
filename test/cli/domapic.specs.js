const test = require('../test')
const mocks = require('../mocks')

const core = require('../../core')

test.describe('Domapic CLI index', () => {
  test.before(() => {
    test.sinon.stub(core.arguments, 'registerCommands')
    require('../../cli/domapic.js')
  })

  test.after(() => {
    core.arguments.registerCommands.restore()
  })

  test.it('should register commands in core arguments handler', () => {
    test.expect(core.arguments.registerCommands).to.have.been.calledWith(mocks.cli.commands)
  })
})
