
const test = require('austral-whale')
const mocks = require('../../mocks')

const utils = require('../../../../lib/utils')
const coreLib = require('../../../../lib/bases/core/index')
const Core = require('../../../../lib/bases/Core')

test.describe('Bases -> Core', () => {
  const fooErrors = {fooProp1: 'fooValue1'}
  const fooPaths = {fooProp2: 'fooValue2'}
  const fooStorage = {fooProp3: 'fooValue3'}
  const fooConfig = {fooProp4: 'fooValue4'}
  const fooTracer = {fooProp5: 'fooValue5'}
  const fooInfo = {fooProp6: 'fooValue6'}
  const fooProcessName = 'testing'
  let core

  const restoreStubs = function () {
    coreLib.Errors.restore()
    coreLib.Paths.restore()
    coreLib.Storage.restore()
    coreLib.Config.restore()
    coreLib.Tracer.restore()
    coreLib.Info.restore()
  }

  const initStubs = function () {
    test.sinon.stub(coreLib, 'Errors').returns(fooErrors)
    test.sinon.stub(coreLib, 'Paths').returns(fooPaths)
    test.sinon.stub(coreLib, 'Storage').returns(fooStorage)
    test.sinon.stub(coreLib, 'Config').returns(fooConfig)
    test.sinon.stub(coreLib, 'Tracer').returns(fooTracer)
    test.sinon.stub(coreLib, 'Info').returns(fooInfo)
  }

  test.beforeEach(() => {
    initStubs()
    core = new Core(mocks.arguments.getResult, fooProcessName)
  })

  test.afterEach(() => {
    restoreStubs()
  })

  test.it('should create a new Errors instance', () => {
    test.expect(coreLib.Errors).to.have.been.calledWithNew()
    test.expect(coreLib.Errors.getCall(0).args[0]).to.be.undefined()
    test.expect(core.errors).to.deep.equal(fooErrors)
  })

  test.it('should create a new Info instance if packagePath option is provided, passing packagePath and errors', () => {
    const fooPath = 'fooPath'
    restoreStubs()
    initStubs()
    core = new Core(mocks.arguments.getResult, fooProcessName, fooPath)
    test.expect(coreLib.Info).to.have.been.calledWithNew()
    test.expect(coreLib.Info.getCall(0).args[0]).to.equal(fooPath)
    test.expect(coreLib.Paths.getCall(0).args[1]).to.deep.equal(fooErrors)
  })

  test.it('should create a new Paths instance, passing options and errors', () => {
    test.expect(coreLib.Paths).to.have.been.calledWithNew()
    test.expect(coreLib.Paths.getCall(0).args[0]).to.deep.equal(mocks.arguments.getResult.options)
    test.expect(coreLib.Paths.getCall(0).args[1]).to.deep.equal(fooErrors)
    test.expect(core.paths).to.deep.equal(fooPaths)
  })

  test.it('should create a new Storage instance, passing processName, paths and errors', () => {
    test.expect(coreLib.Storage).to.have.been.calledWithNew()
    test.expect(coreLib.Storage.getCall(0).args[0].indexOf(fooProcessName)).to.be.above(-1)
    test.expect(coreLib.Storage.getCall(0).args[1]).to.deep.equal(fooPaths)
    test.expect(coreLib.Storage.getCall(0).args[2]).to.deep.equal(fooErrors)
    test.expect(core.storage).to.deep.equal(fooStorage)
  })

  test.it('should create a new Config instance, passing a new Storage instance, args and errors', () => {
    test.expect(coreLib.Config).to.have.been.calledWithNew()
    test.expect(coreLib.Storage.getCall(1).args[0].indexOf(fooProcessName)).to.be.above(-1)
    test.expect(coreLib.Config.getCall(0).args[1]).to.deep.equal(mocks.arguments.getResult)
    test.expect(coreLib.Config.getCall(0).args[2]).to.deep.equal(fooErrors)
    test.expect(core.config).to.deep.equal(fooConfig)
  })

  test.it('should create a new Tracer instance, passing config, paths and errors', () => {
    test.expect(coreLib.Tracer).to.have.been.calledWithNew()
    test.expect(coreLib.Tracer.getCall(0).args[0]).to.deep.equal(fooConfig)
    test.expect(coreLib.Tracer.getCall(0).args[1]).to.deep.equal(fooPaths)
    test.expect(coreLib.Config.getCall(0).args[2]).to.deep.equal(fooErrors)
    test.expect(core.tracer).to.deep.equal(fooTracer)
  })

  test.it('should expose the utilities', () => {
    test.expect(core.utils).to.deep.equal(utils)
  })
})
