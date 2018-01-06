
const Promise = require('bluebird')

const test = require('../index')
const mocks = require('../mocks')

const bases = require('../../lib/bases')
const Service = require('../../lib/Service')

test.describe('Service', () => {
  const fooServer = {
    // TODO, add tests for addApi method
    addApi: test.sinon.stub().usingPromise().resolves()
  }
  const fooClient = {
    fooClientMethod: 'fooCMethod'
  }
  const coreStub = new mocks.core.Stub()
  let getArgumentsStub

  test.beforeEach(() => {
    getArgumentsStub = test.sinon.stub().usingPromise(Promise).resolves(mocks.arguments.getResult)
    test.sinon.stub(bases, 'Arguments').returns({
      get: getArgumentsStub
    })
    test.sinon.stub(bases, 'Core').returns(coreStub)
    test.sinon.stub(bases, 'Server').returns(fooServer)
    test.sinon.stub(bases, 'Client').returns(fooClient)
  })

  test.afterEach(() => {
    bases.Arguments.restore()
    bases.Core.restore()
    bases.Client.restore()
    bases.Server.restore()
  })

  // TODO, remove this test, it only returns a promise temporarily, for error handling purposes
  test.it('should return a Promise', () => {
    test.expect(new Service()).to.be.an.instanceof(Promise)
  })

  test.it('should create a new instance of Core, with name "service"', (done) => {
    new Service()
      .then((result) => {
        test.expect(bases.Core.getCall(0).args[0]).to.deep.equal(mocks.arguments.getResult)
        test.expect(bases.Core.getCall(0).args[1]).to.equal('service')
        done()
      })
  })

  test.it('should return the core tracer', (done) => {
    new Service()
      .then((result) => {
        test.expect(result.tracer).to.deep.equal(coreStub.tracer)
        done()
      })
  })

  test.it('should create a new instance of Server, passing the core', (done) => {
    new Service()
      .then((result) => {
        test.expect(bases.Server).to.have.been.calledWith(coreStub)
        test.expect(result.server).to.deep.equal(fooServer)
        done()
      })
  })

  test.it('should create a new instance of Client, passing the core', (done) => {
    new Service()
      .then((result) => {
        test.expect(bases.Client).to.have.been.calledWith(coreStub)
        test.expect(result.client).to.deep.equal(fooClient)
        done()
      })
  })
})
