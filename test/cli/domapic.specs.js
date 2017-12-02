const test = require('../test')
const mocks = require('../mocks')

const commands = {
  start: require('../../cli/commands/start'),
  stop: require('../../cli/commands/stop'),
  logs: require('../../cli/commands/logs')
}

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
    test.expect(argumentsStub.registerCommands).to.have.been.calledWith(commands)
  })
})
