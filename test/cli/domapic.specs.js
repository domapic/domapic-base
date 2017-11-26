const test = require('../test')

const core = require('../../core')
const start = require('../../cli/commands/start')

test.describe('Domapic CLI index', () => {
  const fooCommands = {
    start: start
  }

  test.before(() => {
    test.sinon.stub(core.arguments, 'registerCommands')
    require('../../cli/domapic.js')
  })

  test.after(() => {
    core.arguments.registerCommands.restore()
  })

  test.it('should register commands in core arguments handler', () => {
    test.expect(core.arguments.registerCommands).to.have.been.calledWith(fooCommands)
  })
})
