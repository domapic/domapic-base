
const _ = require('lodash')
const Promise = require('bluebird')

const test = require('../../../index')
const mocks = require('../../../mocks')

const Config = require('../../../../lib/bases/core/Config')
const Storage = require('../../../../lib/bases/core/Storage')
const Errors = require('../../../../lib/bases/core/Errors')

const UNSTORABLE_CONFIG = ['name', 'saveConfig']

test.describe('Bases -> Core -> Config', () => {
  const errors = new Errors()
  let storage
  let storageGet
  let storageSet
  let config

  test.beforeEach(() => {
    storage = new Storage(mocks.storage.options.fileName, {}, errors)
    storageGet = test.sinon.stub(storage, 'get').usingPromise(Promise).resolves(mocks.arguments.getResult.defaults)
    storageSet = test.sinon.stub(storage, 'set').usingPromise(Promise).resolves(mocks.arguments.getResult.defaults)
    config = new Config(storage, mocks.arguments.getResult, errors)
  })

  test.afterEach(() => {
    storage.get.restore()
    storage.set.restore()
  })

  test.describe('get', () => {
    test.it('should return a Promise', (done) => {
      let response = config.get()
        .then(() => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should read the stored config first time it is called', (done) => {
      config.get()
        .then(() => {
          test.expect(storageGet).to.have.been.called()
          done()
        })
    })

    test.it('should not read the stored config more than one time', (done) => {
      config.get()
        .then(() => {
          config.get()
            .then(() => {
              test.expect(storageGet).to.have.been.calledOnce()
              done()
            })
        })
    })

    test.it('should store the received defaults options that were not already saved', (done) => {
      storageGet.resolves({})
      config.get()
        .then(() => {
          test.expect(storageSet).to.have.been.calledWith(mocks.arguments.getResult.defaultsToStore)
          done()
        })
    })

    test.it('should not store the "unstorable" keys', (done) => {
      let customArguments = JSON.parse(JSON.stringify(mocks.arguments.getResult))
      customArguments.explicit.saveConfig = true
      config = new Config(storage, customArguments, errors)
      config.get()
        .then(() => {
          _.each(UNSTORABLE_CONFIG, (unstorableKey) => {
            test.expect(storageSet.getCall(0).args[0][unstorableKey]).to.be.undefined()
          })
          done()
        })
    })

    test.it('should store all current configuration if "saveConfig" option is received', (done) => {
      let customArguments = JSON.parse(JSON.stringify(mocks.arguments.getResult))
      customArguments.explicit.saveConfig = true

      config = new Config(storage, customArguments, errors)
      config.get()
        .then(() => {
          test.expect(storageSet.getCall(0).args[0]).to.deep.equal(_.omit(_.extend({},
            mocks.arguments.getResult.defaults,
            mocks.arguments.getResult.explicit
          ), UNSTORABLE_CONFIG))
          done()
        })
    })

    test.it('should return the stored config, extended with the explicit received options', (done) => {
      config.get()
        .then((configuration) => {
          test.expect(configuration).to.deep.equal(_.extend({},
            mocks.arguments.getResult.defaults,
            mocks.arguments.getResult.explicit
          ))
          done()
        })
    })

    test.it('should return only the key received as parameter', (done) => {
      config.get('port')
        .then((port) => {
          test.expect(port).to.equal(mocks.arguments.getResult.defaults.port)
          done()
        })
    })
  })
})
