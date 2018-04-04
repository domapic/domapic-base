
const _ = require('lodash')
const Promise = require('bluebird')
const yargs = require('yargs')

const test = require('austral-whale')
const mocks = require('../../mocks')

const Arguments = require('../../../../lib/bases/Arguments')

const serviceArguments = require('../../../../lib/arguments/service')
const coreArguments = require('../../../../lib/arguments/core')

const commands = {
  start: require('../../../../lib/cli/start'),
  stop: require('../../../../lib/cli/stop'),
  logs: require('../../../../lib/cli/logs')
}

test.describe('Bases -> Arguments', () => {
  const aliasStub = test.sinon.spy(() => {})
  let yargsParseStub

  test.beforeEach(() => {
    test.sinon.stub(yargs, 'option')
    test.sinon.stub(yargs, 'strict').returns(yargs)
    test.sinon.stub(yargs, 'help').returns({
      alias: aliasStub
    })
    test.sinon.stub(yargs, 'wrap')
    test.sinon.stub(yargs, 'terminalWidth').returns(mocks.arguments.terminalWidth)
    yargsParseStub = test.sinon.stub(yargs, 'parse')
  })

  test.afterEach(() => {
    yargs.wrap.restore()
    yargs.option.restore()
    yargs.strict.restore()
    yargs.help.restore()
    yargs.terminalWidth.restore()
    yargs.parse.restore()
  })

  test.describe('get', () => {
    let args

    test.beforeEach(() => {
      args = new Arguments(serviceArguments)
    })

    test.it('should return a Promise', () => {
      return test.expect(args.get()).to.be.an.instanceof(Promise)
    })

    test.it('should initialize yargs, and call it to get the value of the core arguments and those in the "arguments" option', () => {
      let allArguments = _.extend({}, coreArguments, serviceArguments)
      return args.get()
        .then(() => {
          let asserts = [
            test.expect(yargs.strict).to.have.been.called(),
            test.expect(yargs.help).to.have.been.called(),
            test.expect(aliasStub).to.have.been.called(),
            test.expect(yargs.parse).to.have.been.called(),
            test.expect(yargs.wrap).to.have.been.calledWith(mocks.arguments.terminalWidth)
          ]
          _.each(allArguments, (properties, name) => {
            asserts.push(test.expect(yargs.option).to.have.been.calledWith(name, properties))
          })
          return Promise.all(asserts)
        })
    })

    test.it('should return only those arguments that were defined in the "arguments" option and in the core', () => {
      let fakeOptionsReturn = _.extend({}, mocks.arguments.getResult.options, {
        fooOption1: 'fooValue'
      })
      yargsParseStub.returns(fakeOptionsReturn)
      return args.get()
        .then((result) => {
          return test.expect(result.options).to.deep.equal(mocks.arguments.getResult.options)
        })
    })

    test.it('should return the default values of all arguments', () => {
      let allArguments = _.extend({}, coreArguments, {
        fooArgument1: {
          default: 'fooValue1'
        },
        fooArgument2: {
          default: 'fooValue2'
        }
      })

      args = new Arguments(allArguments)

      return args.get()
        .then((result) => {
          return Promise.all([
            test.expect(result.defaults.fooArgument1).to.equal('fooValue1'),
            test.expect(result.defaults.fooArgument2).to.equal('fooValue2')
          ])
        })
    })

    test.it('should return the explicit arguments received, omitting those which value was get from defaults. Even if yargs has not returned it', () => {
      process.argv.push('--p=123')
      return args.get()
        .then((result) => {
          return test.expect(result.explicit).to.deep.equal({
            port: '123'
          })
        })
        .finally(() => {
          process.argv.pop()
        })
    })

    test.it('should consider as true a given argument if only argument name is passed', () => {
      process.argv.push('--p')
      return args.get()
        .then((result) => {
          return test.expect(result.explicit).to.deep.equal({
            port: true
          })
        })
        .finally(() => {
          process.argv.pop()
        })
    })

    test.it('should return the explicit arguments received, getting the value from yargs result', () => {
      const fooValue = '123'
      process.argv.push('--p=' + fooValue)
      yargsParseStub.returns(_.extend({}, mocks.arguments.getResult.options, {port: fooValue}))
      return args.get()
        .then((result) => {
          return test.expect(result.explicit).to.deep.equal({
            port: fooValue
          })
        })
        .finally(() => {
          process.argv.pop()
        })
    })
  })

  test.describe('runCommand', () => {
    let args
    let cliCommandsMethods
    let registeredCommands = []
    let startCommandStub

    const fooYargsCommand = function (cli, describe, getOptions, commandLauncher) {
      registeredCommands.push(commandLauncher)
    }

    const launchCommand = function () {
      registeredCommands[0](mocks.arguments.getResult.options)
    }

    test.beforeEach(() => {
      registeredCommands = []
      args = new Arguments()
      cliCommandsMethods = mocks.arguments.cliCommandsMethods()
      test.sinon.stub(yargs, 'command').callsFake(fooYargsCommand)
      test.sinon.stub(yargs, 'demandCommand').callsFake(launchCommand)
      startCommandStub = test.sinon.stub(commands.start, 'command').usingPromise(Promise).resolves()
      test.sinon.stub(commands.stop, 'command').usingPromise(Promise).resolves()
      test.sinon.stub(commands.logs, 'command').usingPromise(Promise).resolves()
      test.sinon.spy(cliCommandsMethods, 'get')
    })

    test.afterEach(() => {
      yargs.command.restore()
      yargs.demandCommand.restore()
      commands.start.command.restore()
      commands.stop.command.restore()
      commands.logs.command.restore()
      cliCommandsMethods.get.restore()
    })

    test.it('should return a Promise', () => {
      return test.expect(args.runCommand(commands, cliCommandsMethods.get)).to.be.an.instanceof(Promise)
    })

    test.it('should throw an error if any command option overrides a core option', () => {
      const fooCommands = JSON.parse(JSON.stringify(commands))
      fooCommands.start.options.color = {}
      return args.runCommand(fooCommands, cliCommandsMethods.get)
        .catch((error) => {
          return test.expect(error.message).to.include('color')
        })
    })

    test.it('should call yargs to register all defined commands', () => {
      return args.runCommand(commands, cliCommandsMethods.get)
        .then(() => {
          return Promise.all(_.map(commands, (properties, commandName) => {
            return test.expect(yargs.command).to.have.been.calledWith(properties.cli, properties.describe)
          }))
        })
    })

    test.it('should demmand yargs to run one command at least', () => {
      return args.runCommand(commands, cliCommandsMethods.get)
        .then(() => {
          return test.expect(yargs.command).to.have.been.called()
        })
    })

    test.describe('when launchs command', () => {
      test.it('should call get methods for the command, passing the arguments', () => {
        return args.runCommand({
          start: _.extend({}, commands.start, {cli: 'start [testing] [testing2] [testing3] <testing4>'})
        }, cliCommandsMethods.get)
          .then(() => {
            return Promise.all([
              test.expect(cliCommandsMethods.get.getCall(0).args[0].options).to.deep.equal(mocks.arguments.getResult.options),
              test.expect(cliCommandsMethods.get.getCall(0).args[0].defaults).to.deep.equal(mocks.arguments.getResult.defaults)
            ])
          })
      })

      test.it('should pass the explicit arguments to the getCliCommands method, including the defined in the "cli" regex (as [name])', () => {
        const fooValue1 = 'fooValue1'
        const fooValue2 = 'fooValue2'
        process.argv.push(fooValue1)
        process.argv.push(fooValue2)
        args = new Arguments()
        return args.runCommand({
          start: _.extend({}, commands.start, {cli: 'start [testing] <testing2>'})
        }, cliCommandsMethods.get)
        .then(() => {
          return Promise.all([
            test.expect(cliCommandsMethods.get.getCall(0).args[0].explicit.testing).to.equal(fooValue1),
            test.expect(cliCommandsMethods.get.getCall(0).args[0].explicit.testing2).to.equal(fooValue2)
          ])
        })
        .finally(() => {
          process.argv.pop()
          process.argv.pop()
        })
      })

      test.it('should reject the promise if retrieving configuration fails', () => {
        let cliCommandsMethods = mocks.arguments.cliCommandsMethods()
        cliCommandsMethods.config.get.rejects(new Error())
        return args.runCommand(commands, cliCommandsMethods.get)
          .catch((error) => {
            return test.expect(error).to.be.an.instanceof(Error)
          })
      })

      test.it('should execute the command, passing to it the config from cli methods, the cli commands methods itself, and the arguments', () => {
        return args.runCommand(commands, cliCommandsMethods.get)
          .then(() => {
            return Promise.all([
              test.expect(commands.start.command).to.have.been.calledWith(mocks.config.getResult, {
                config: cliCommandsMethods.config,
                tracer: cliCommandsMethods.tracer
              }),
              test.expect(commands.start.command.getCall(0).args[2].options).to.deep.equal(mocks.arguments.getResult.options),
              test.expect(commands.start.command.getCall(0).args[2].defaults).to.deep.equal(mocks.arguments.getResult.defaults)
            ])
          })
      })

      test.it('should reject the promise if the command execution fails', () => {
        startCommandStub.rejects(new Error())
        return args.runCommand(commands, cliCommandsMethods.get)
          .catch(() => {
            return test.expect(cliCommandsMethods.tracer.error).to.have.been.called()
          })
      })
    })
  })
})
