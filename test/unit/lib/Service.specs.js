
const _ = require('lodash')
const Promise = require('bluebird')

const test = require('../index')
const mocks = require('../mocks')

const bases = require('../../../lib/bases')
const Service = require('../../../lib/Service')
const serviceArguments = require('../../../lib/arguments/service')

test.describe('Service', () => {
  const coreExposedProperties = ['config', 'errors', 'info', 'storage', 'tracer', 'utils']

  const fooServer = {
    // TODO, add tests for this methods
    extendOpenApi: test.sinon.stub().usingPromise().resolves(),
    addOperations: test.sinon.stub().usingPromise().resolves(),
    addAuthentication: test.sinon.stub().usingPromise().resolves()
  }
  const fooClient = {
    fooClientMethod: 'fooCMethod'
  }
  const coreStub = new mocks.core.Stub()
  const ensureCoreProperty = function (coreProperty) {
    test.it('should return the core ' + coreProperty, (done) => {
      new Service()
        .then((result) => {
          test.expect(result[coreProperty]).to.deep.equal(coreStub[coreProperty])
          done()
        })
    })
  }
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

  test.it('should return a Promise', () => {
    test.expect(new Service()).to.be.an.instanceof(Promise)
  })

  test.it('should call Arguments to get arguments correspondant to core and service options', (done) => {
    new Service()
      .then((result) => {
        test.expect(bases.Arguments.getCall(0).args[0]).to.deep.equal(serviceArguments)
        done()
      })
  })

  test.it('should extend the service arguments with received customConfig', (done) => {
    const customConfig = {
      fooOption: {}
    }
    new Service({customConfig: customConfig})
      .then((result) => {
        test.expect(bases.Arguments.getCall(0).args[0]).to.deep.equal(_.extend({}, serviceArguments, customConfig))
        done()
      })
  })

  test.it('should reject the promise if a customConfig property already exists in service arguments', (done) => {
    const customConfig = {
      authDisabled: {}
    }
    new Service({customConfig: customConfig})
      .catch((error) => {
        test.expect(error.message).to.include('authDisabled')
        done()
      })
  })

  test.it('should reject the promise if a customConfig property already exists in core arguments', (done) => {
    const customConfig = {
      logLevel: {}
    }
    new Service({customConfig: customConfig})
      .catch((error) => {
        test.expect(error.message).to.include('logLevel')
        done()
      })
  })

  test.it('should create a new instance of Core, with name "service"', (done) => {
    new Service()
      .then((result) => {
        test.expect(bases.Core.getCall(0).args[0]).to.deep.equal(mocks.arguments.getResult)
        test.expect(bases.Core.getCall(0).args[1]).to.equal('service')
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

  _.each(coreExposedProperties, (coreProperty) => {
    ensureCoreProperty(coreProperty)
  })
})
