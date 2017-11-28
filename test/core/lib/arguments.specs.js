const yargs = require('yargs')
const _ = require('lodash')

const test = require('../../test')
const mocks = require('../../mocks')

const core = require('../../../core')
const start = require('../../../cli/commands/start')

test.describe('Core Arguments', () => {
  const optionsLength = _.keys(start.options).length
  const SharedTests = function (callMethod) {
    return function () {
      test.it('should avoid defining unknown options', (done) => {
        callMethod()
          .then(() => {
            test.expect(yargs.strict).to.have.been.called()
            done()
          })
      })

      test.it('should set the CLI width to terminal width', (done) => {
        test.sinon.stub(yargs, 'wrap')
        callMethod()
          .then(() => {
            test.expect(yargs.wrap).to.have.been.calledWith(yargs.terminalWidth())
            yargs.wrap.restore()
            done()
          })
      })

      test.it('should initialize the CLI help', (done) => {
        test.sinon.stub(yargs, 'help').returns(yargs)
        callMethod()
          .then(() => {
            test.expect(yargs.help).to.have.been.called()
            yargs.help.restore()
            done()
          })
      })
    }
  }
  let args, mock

  test.beforeEach(() => {
    args = new core.Arguments()

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
      return args.getOptions(start.options)
    }
    test.it('should call yargs to get the defined value for each option', (done) => {
      mock.expects('option').exactly(optionsLength)
      callMethod()
        .then(() => {
          mock.verify()
          done()
        })
    })

    test.it('should return an object with options values', (done) => {
      callMethod()
        .then(result => {
          test.expect(result).to.have.all.keys(_.keys(start.options))
          done()
        })
    })

    new SharedTests(callMethod)()
  })

  test.describe('registerCommands', () => {
    const callMethod = function () {
      return args.registerCommands(mocks.cli.commands)
    }

    test.it('should demand the user the command to execute', (done) => {
      callMethod()
        .then(() => {
          test.expect(yargs.demandCommand).to.have.been.called()
          done()
        })
    })

    test.it('should call yargs to register all defined commands', (done) => {
      test.sinon.stub(yargs, 'command')
      callMethod()
        .then(() => {
          test.expect(yargs.command).to.have.been.callCount(_.keys(mocks.cli.commands).length)
          yargs.command.restore()
          done()
        })
    })

    test.it('When a command is dispatched, its "command" property should be called with user options', (done) => {
      let originalCommand = yargs.command

      yargs.command = function (cli, describe, getOptions, callBack) {
        callBack(_.extend({}, mocks.arguments.options, mocks.arguments.wrongOptions))
      }

      test.sinon.stub(start, 'command')
      callMethod()
        .then(() => {
          test.expect(start.command).to.have.been.called()
          test.expect(start.command).to.have.been.calledWith(mocks.arguments.options)

          yargs.command = originalCommand
          start.command.restore()
          done()
        })
    })

    new SharedTests(callMethod)()
  })
})
