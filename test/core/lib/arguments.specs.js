const yargs = require('yargs')
const _ = require('lodash')

const test = require('../../test')

const core = require('../../../core')
const startCommand = require('../../../cli/commands/start')

test.describe('Core Arguments', () => {
  const optionsLength = _.keys(startCommand.options).length
  const SharedTests = function (callMethod) {
    return function (yargs) {
      test.it('should avoid defining unknown options', () => {
        callMethod()
        test.expect(yargs.strict).to.have.been.called()
      })

      test.it('should set the CLI width to terminal width', () => {
        test.sinon.stub(yargs, 'wrap')
        callMethod()
        test.expect(yargs.wrap).to.have.been.calledWith(yargs.terminalWidth())
        yargs.wrap.restore()
      })

      test.it('should initialize the CLI help', () => {
        test.sinon.stub(yargs, 'help').returns(yargs)
        callMethod()
        test.expect(yargs.help).to.have.been.called()
        yargs.help.restore()
      })
    }
  }
  let mock

  test.beforeEach(() => {
    test.sinon.stub(yargs, 'strict').returns(yargs)
    test.sinon.stub(yargs, 'demandCommand')
    mock = test.sinon.mock(yargs)
  })

  test.afterEach(() => {
    mock.restore()
    yargs.strict.restore()
    yargs.demandCommand.restore()
  })

  test.describe('getOptions', () => {
    const callMethod = function () {
      return core.arguments.getOptions(startCommand.options, yargs)
    }
    test.it('should call yargs to get the defined value for each option', () => {
      mock.expects('option').exactly(optionsLength)
      callMethod()
      mock.verify()
    })

    test.it('should return an object with options values', () => {
      let result = callMethod()
      test.expect(result).to.have.all.keys(_.keys(startCommand.options))
    })

    new SharedTests(callMethod)(yargs)
  })

  test.describe('registerCommands', () => {
    const fooCommands = {
      start: startCommand
    }
    const callMethod = function () {
      return core.arguments.registerCommands(fooCommands, yargs)
    }

    test.it('should demand the user the command to execute', () => {
      callMethod()
      test.expect(yargs.demandCommand).to.have.been.called()
    })

    test.it('should call yargs to register all defined commands', () => {
      test.sinon.stub(yargs, 'command')
      callMethod()
      test.expect(yargs.command).to.have.been.callCount(_.keys(fooCommands).length)
      yargs.command.restore()
    })

    test.it('When a command is dispatched, its "command" property should be called with user options', () => {
      const fooParams = {
        name: 'testing',
        port: 12345
      }
      let originalCommand = yargs.command

      yargs.command = function (cli, describe, getOptions, callBack) {
        // Extends fooParams with extra options, to ensure they are cleaned
        callBack(_.extend({}, fooParams, {
          n: 'testing2',
          p: 543543
        }))
      }

      test.sinon.stub(fooCommands.start, 'command')
      callMethod()

      test.expect(fooCommands.start.command).to.have.been.called()
      test.expect(fooCommands.start.command).to.have.been.calledWith(fooParams)

      yargs.command = originalCommand
      fooCommands.start.command.restore()
    })

    new SharedTests(callMethod)(yargs)
  })
})
