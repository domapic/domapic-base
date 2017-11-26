const yargs = require('yargs')
const _ = require('lodash')

const test = require('../../test')
const mocks = require('../../mocks')

const core = require('../../../core')
const start = require('../../../cli/commands/start')

test.describe('Core Arguments', () => {
  const optionsLength = _.keys(start.options).length
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
  let args, mock

  test.beforeEach(() => {
    args = new core.Arguments(yargs)

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
      return args.getOptions(start.options, yargs)
    }
    test.it('should call yargs to get the defined value for each option', () => {
      mock.expects('option').exactly(optionsLength)
      callMethod()
      mock.verify()
    })

    test.it('should return an object with options values', () => {
      let result = callMethod()
      test.expect(result).to.have.all.keys(_.keys(start.options))
    })

    new SharedTests(callMethod)(yargs)
  })

  test.describe('registerCommands', () => {
    const callMethod = function () {
      return args.registerCommands(mocks.cli.commands, yargs)
    }

    test.it('should demand the user the command to execute', () => {
      callMethod()
      test.expect(yargs.demandCommand).to.have.been.called()
    })

    test.it('should call yargs to register all defined commands', () => {
      test.sinon.stub(yargs, 'command')
      callMethod()
      test.expect(yargs.command).to.have.been.callCount(_.keys(mocks.cli.commands).length)
      yargs.command.restore()
    })

    test.it('When a command is dispatched, its "command" property should be called with user options', () => {
      let originalCommand = yargs.command

      yargs.command = function (cli, describe, getOptions, callBack) {
        callBack(_.extend({}, mocks.arguments.options, mocks.arguments.wrongOptions))
      }

      test.sinon.stub(start, 'command')
      callMethod()

      test.expect(start.command).to.have.been.called()
      test.expect(start.command).to.have.been.calledWith(mocks.arguments.options)

      yargs.command = originalCommand
      start.command.restore()
    })

    new SharedTests(callMethod)(yargs)
  })
})
