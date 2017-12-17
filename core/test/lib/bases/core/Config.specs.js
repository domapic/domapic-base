
const _ = require('lodash')
const Promise = require('bluebird')

const test = require('../../../index')
const mocks = require('../../../mocks')

const Config = require('../../../../lib/bases/core/Config')
const Storage = require('../../../../lib/bases/core/Storage')
const Errors = require('../../../../lib/bases/core/Errors')

test.describe('Bases -> Core -> Config', () => {
  const errors = new Errors()
  const storage = new Storage(mocks.storage.options.fileName, {}, errors)
  let storageGet
  let storageSet
  let config

  test.beforeEach(() => {
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
          test.expect(storageSet).to.have.been.calledWith(mocks.arguments.getResult.defaults)
          done()
        })
    })

    test.it('should return the stored config, extended with the explicit received options', (done) => {
      storageGet.resolves({})
      config.get()
        .then((configuration) => {
          test.expect(configuration).to.deep.equal(_.extend(
            mocks.arguments.getResult.defaults,
            mocks.arguments.getResult.explicit
          ))
          done()
        })
    })
  })
})
