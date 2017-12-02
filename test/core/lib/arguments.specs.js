const _ = require('lodash')
const yargs = require('yargs')

const test = require('../../test')
const mocks = require('../../mocks')

const core = require('../../../core')
const commands = {
  start: require('../../../cli/commands/start'),
  stop: require('../../../cli/commands/stop'),
  logs: require('../../../cli/commands/logs')
}

test.describe('Core Arguments', () => {
  const optionsLength = _.keys(commands.start.options).length
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
      return args.getOptions(commands.start.options)
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
          test.expect(result).to.have.all.keys(_.keys(commands.start.options))
          done()
        })
    })

    new SharedTests(callMethod)()
  })

  test.describe('registerCommands', () => {
    const callMethod = function (command) {
      command = command || commands
      return args.registerCommands(command)
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
          test.expect(yargs.command).to.have.been.callCount(_.keys(commands).length)
          yargs.command.restore()
          done()
        })
    })

    _.forEach(commands, (command, commandName) => {
      test.describe('When ' + commandName + ' command is dispatched', () => {
        test.beforeEach(() => {
          test.sinon.stub(process, 'exit')
          test.sinon.stub(console, 'error')
        })

        test.afterEach(() => {
          process.exit.restore()
          console.error.restore()
        })

        test.it('should call its "command" function with user options', (done) => {
          const originalYargsCommand = yargs.command
          let fooCommandsObject = {}

          fooCommandsObject[commandName] = command

          yargs.command = function (cli, describe, getOptions, callBack) {
            callBack(_.extend({}, mocks.commands[commandName].options, mocks.arguments.wrongOptions))
          }

          test.sinon.stub(command, 'command').returns({
            catch: () => {}
          })

          callMethod(fooCommandsObject)
            .then(() => {
              test.expect(command.command).to.have.been.called()
              test.expect(command.command).to.have.been.calledWith(mocks.commands[commandName].options)

              yargs.command = originalYargsCommand
              command.command.restore()
              done()
            })
        })

        test.it('should log the error message and exit process if throws an error', (done) => {
          const originalYargsCommand = yargs.command
          const originalCommand = command.command
          const errorMessage = 'error from ' + commandName + ' command'
          let fooCommandsObject = {}

          fooCommandsObject[commandName] = command

          command.command = function () {
            return new Promise(() => {
              throw new Error(errorMessage)
            })
          }
          yargs.command = function (cli, describe, getOptions, callBack) {
            callBack(mocks.commands[commandName].options)
          }

          callMethod(fooCommandsObject)
            .then(() => {
              test.expect(process.exit).to.have.been.called()
              yargs.command = originalYargsCommand
              command.command = originalCommand
              done()
            })
        })
      })
    })

    new SharedTests(callMethod)()
  })
})
