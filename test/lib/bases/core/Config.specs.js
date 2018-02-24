
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
    test.it('should return a Promise', () => {
      return test.expect(config.get()).to.be.an.instanceof(Promise)
    })

    test.it('should read the stored config first time it is called', () => {
      return config.get()
        .then(() => {
          return test.expect(storageGet).to.have.been.called()
        })
    })

    test.it('should not read the stored config more than one time', () => {
      return Promise.all([
        config.get(),
        config.get()
      ]).then(() => {
        return config.get()
          .then(() => {
            return test.expect(storageGet).to.have.been.calledOnce()
          })
      })
    })

    test.it('should store the received defaults options that were not already saved', () => {
      storageGet.resolves({})
      return config.get()
        .then(() => {
          return test.expect(storageSet).to.have.been.calledWith(mocks.arguments.getResult.defaultsToStore)
        })
    })

    test.it('should not store the "unstorable" keys', () => {
      let customArguments = JSON.parse(JSON.stringify(mocks.arguments.getResult))
      customArguments.explicit.saveConfig = true
      config = new Config(storage, customArguments, errors)
      return config.get()
        .then(() => {
          return Promise.map(UNSTORABLE_CONFIG, (unstorableKey) => {
            return test.expect(storageSet.getCall(0).args[0][unstorableKey]).to.be.undefined()
          })
        })
    })

    test.it('should store all current configuration if "saveConfig" option is received', () => {
      let customArguments = JSON.parse(JSON.stringify(mocks.arguments.getResult))
      customArguments.explicit.saveConfig = true

      config = new Config(storage, customArguments, errors)
      return config.get()
        .then(() => {
          return test.expect(storageSet.getCall(0).args[0]).to.deep.equal(_.omit(_.extend({},
            mocks.arguments.getResult.defaults,
            mocks.arguments.getResult.explicit
          ), UNSTORABLE_CONFIG))
        })
    })

    test.it('should return the stored config, extended with the explicit received options', () => {
      return config.get()
        .then((configuration) => {
          return test.expect(configuration).to.deep.equal(_.extend({},
            mocks.arguments.getResult.defaults,
            mocks.arguments.getResult.explicit
          ))
        })
    })

    test.it('should return a clone of the configuration in order to avoid external modifications', () => {
      return config.get()
        .then((configuration) => {
          configuration.fooProperty = 'foo'
          return config.get()
        })
        .then((configuration) => {
          return test.expect(configuration.fooProperty).to.be.undefined()
        })
    })

    test.it('should return only the key received as parameter', () => {
      return config.get('port')
        .then((port) => {
          return test.expect(port).to.equal(mocks.arguments.getResult.defaults.port)
        })
    })
  })

  test.describe('set', () => {
    const fooKey = 'fooKey'
    const fooValue = 'fooValue'

    test.it('should return a Promise', () => {
      return test.expect(config.set(fooKey, fooValue)).to.be.an.instanceof(Promise)
    })

    test.it('should build base config if it is not already ready', () => {
      return config.set(fooKey, fooValue)
        .then(() => {
          return test.expect(storageGet).to.have.been.calledOnce()
        })
    })

    test.it('should reject the promise if no key is defined to be set', () => {
      return config.set()
        .catch((error) => {
          return test.expect(error).to.be.an.instanceof(errors.BadData)
        })
    })

    test.it('should call to store the new value', () => {
      return config.set(fooKey, fooValue)
        .then(() => {
          return Promise.all([
            test.expect(storageSet.getCall(0).args[0]).to.equal(fooKey),
            test.expect(storageSet.getCall(0).args[1]).to.equal(fooValue)
          ])
        })
    })

    test.it('should return the new value', () => {
      return config.set(fooKey, fooValue)
        .then((value) => {
          return test.expect(value).to.equal(fooValue)
        })
    })

    test.it('should store the new value in memory, to be available for next "get" calls', () => {
      const fooValue2 = 'fooValue2'
      return config.set(fooKey, fooValue)
        .then(() => {
          return config.get(fooKey)
            .then((value) => {
              return config.set(fooKey, fooValue2)
                .then(() => {
                  return config.get(fooKey)
                    .then((value2) => {
                      return Promise.all([
                        test.expect(value).to.equal(fooValue),
                        test.expect(value2).to.equal(fooValue2)
                      ])
                    })
                })
            })
        })
    })
  })
})
