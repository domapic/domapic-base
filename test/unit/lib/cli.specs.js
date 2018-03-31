
const Promise = require('bluebird')
const _ = require('lodash')
const test = require('mocha-sinon-chai')

const mocks = require('../mocks')

const bases = require('../../../lib/bases')
const cli = require('../../../lib/cli')

const start = require('../../../lib/cli/start')
const stop = require('../../../lib/cli/stop')
const logs = require('../../../lib/cli/logs')

test.describe('cli', () => {
  let coreStub
  const argumentsStub = new mocks.arguments.Stub()

  test.beforeEach(() => {
    coreStub = new mocks.core.Stub()
    test.sinon.spy(_, 'extend')
    test.sinon.stub(bases, 'Arguments').returns(argumentsStub)
    test.sinon.stub(bases, 'Core').returns(coreStub)
  })

  test.afterEach(() => {
    _.extend.restore()
    bases.Arguments.restore()
    bases.Core.restore()
  })

  test.it('should call Arguments runCommand function in order to run the command received from command line', () => {
    cli()
    test.expect(argumentsStub.runCommand).to.have.been.called()
  })

  test.it('should extend the base commands with the received custom commands', () => {
    const fooCustomCommands = {
      fooCommand: {}
    }
    cli({
      customCommands: fooCustomCommands
    })
    return Promise.all([
      test.expect(_.extend.getCall(1).args[2]).to.deep.equal(fooCustomCommands),
      test.expect(_.extend.getCall(1).args[1]).to.deep.equal({
        start: start,
        stop: stop,
        logs: logs
      })
    ])
  })

  test.it('should throw an error if any custom command has the same name than a base command', () => {
    const fooCustomCommands = {
      stop: {}
    }
    try {
      cli({
        customCommands: fooCustomCommands
      })
    } catch (error) {
      test.expect(error).to.be.an.instanceof(Error)
    }
  })

  test.it('should extend the start command options with the received custom config options', () => {
    const fooCustomConfig = {
      fooOption: {}
    }
    cli({
      customConfig: fooCustomConfig
    })
    return Promise.all([
      test.expect(_.extend.getCall(0).args[2]).to.deep.equal(fooCustomConfig),
      test.expect(_.extend.getCall(0).args[1]).to.deep.equal(start.options)
    ])
  })

  test.it('should throw an error if any custom config has the same name than a start command option', () => {
    const fooCustomConfig = {
      port: {}
    }
    try {
      cli({
        customConfig: fooCustomConfig
      })
    } catch (error) {
      test.expect(error).to.be.an.instanceof(Error)
    }
  })

  test.it('should throw an error if any custom config has the same name than a core option', () => {
    const fooCustomConfig = {
      name: {}
    }
    try {
      cli({
        fooCustomConfig: fooCustomConfig
      })
    } catch (error) {
      test.expect(error).to.be.an.instanceof(Error)
    }
  })

  test.describe('methods passed to the cli command function', () => {
    let getCliCommandsMethodsPromise
    const fooProcess = {
      fooProperty: 'fooValue'
    }
    const fooArgsOptions = {
      fooOption: 'fooOption'
    }
    const fooProcessName = 'fooName'
    const fooPackagePath = 'fooPackagePath'
    const runCommand = function (commands, getCliCommandsMethods) {
      getCliCommandsMethodsPromise = getCliCommandsMethods(fooArgsOptions, fooProcessName)
    }

    test.beforeEach(() => {
      bases.Arguments.restore()
      test.sinon.stub(bases, 'Arguments').returns(_.extend({}, argumentsStub, {
        runCommand: test.sinon.stub().callsFake(runCommand)
      }))
      test.sinon.stub(bases, 'Process').returns(fooProcess)
    })

    test.afterEach(() => {
      bases.Process.restore()
    })

    test.it('should be created through a new "core" instance created passing to it the received command line options, the process name and the packagePath option', () => {
      cli({
        packagePath: fooPackagePath
      })
      return Promise.all([
        test.expect(bases.Core.getCall(0).args[0]).to.deep.equal(fooArgsOptions),
        test.expect(bases.Core.getCall(0).args[1]).to.equal(fooProcessName),
        test.expect(bases.Core.getCall(0).args[2]).to.equal(fooPackagePath)
      ])
    })

    test.it('should get the config from core, and reject the promise if core.config.get is rejected', () => {
      coreStub.config.get.rejects(new Error())
      cli({
        packagePath: fooPackagePath
      })
      return getCliCommandsMethodsPromise.catch((err) => {
        return Promise.all([
          test.expect(coreStub.config.get).to.have.been.called(),
          test.expect(err).to.be.an.instanceof(Error)
        ])
      })
    })

    test.it('should return a new Process instance, created with the script path received in options, and the name returned by config', () => {
      const fooScriptPath = 'fooScript'
      cli({
        packagePath: fooPackagePath,
        script: fooScriptPath
      })
      return getCliCommandsMethodsPromise.then((result) => {
        return Promise.all([
          test.expect(result.process).to.deep.equal(fooProcess),
          test.expect(bases.Process.getCall(0).args[0].script).to.equal(fooScriptPath),
          test.expect(bases.Process.getCall(0).args[0].name).to.equal(mocks.config.getResult.name),
          test.expect(bases.Process.getCall(0).args[1]).to.deep.equal(coreStub)
        ])
      })
    })

    test.it('should return tracer, errors, config and utils methods from core', () => {
      cli()
      return getCliCommandsMethodsPromise.then((result) => {
        return Promise.all([
          test.expect(result.tracer).to.deep.equal(coreStub.tracer),
          test.expect(result.errors).to.deep.equal(coreStub.errors),
          test.expect(result.config).to.deep.equal(coreStub.config),
          test.expect(result.utils).to.deep.equal(coreStub.utils)
        ])
      })
    })
  })
})
