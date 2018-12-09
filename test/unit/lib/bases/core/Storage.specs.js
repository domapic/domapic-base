
const _ = require('lodash')
const Promise = require('bluebird')

const test = require('narval')
const mocks = require('../../../mocks')

const Storage = require('../../../../../lib/bases/core/Storage')
const Paths = require('../../../../../lib/bases/core/Paths')
const Errors = require('../../../../../lib/bases/core/Errors')

test.describe('Bases -> Core -> Storage', () => {
  const errors = new Errors()
  const paths = new Paths(mocks.arguments.options, errors)
  let storage

  test.beforeEach(() => {
    test.sinon.spy(JSON, 'stringify')
    test.sinon.stub(paths, 'readJSON').usingPromise(Promise).resolves(mocks.storage.data)
    test.sinon.stub(paths, 'ensureJSON').usingPromise(Promise).resolves(mocks.storage.options.fileName)
    test.sinon.stub(paths, 'writeJSON').usingPromise(Promise).resolves(mocks.storage.options.fileName)
    storage = new Storage(mocks.storage.options.fileName, paths, errors, 'storage/')
  })

  test.afterEach(() => {
    JSON.stringify.restore()
    paths.readJSON.restore()
    paths.ensureJSON.restore()
    paths.writeJSON.restore()
  })

  test.describe('Constructor', () => {
    test.it('should throw a Bad Data error if no fileName is provided', () => {
      let customStorage
      let error
      try {
        customStorage = new Storage(null, paths, errors)
      } catch (err) {
        error = err
      }
      test.expect(customStorage).to.equal(undefined)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })
  })

  test.describe('get', () => {
    const testClonedByType = function (description, key) {
      test.it(description, (done) => {
        let dataKey = key
        storage.get(dataKey)
          .then((value) => {
            test.expect(JSON.stringify).to.have.been.calledWith(mocks.storage.data[dataKey])
            test.expect(value).to.deep.equal(mocks.storage.data[dataKey])
            done()
          })
      })
    }

    test.it('should return a Promise', (done) => {
      let response = storage.get()
        .then(() => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should ensure that file exists before reading it', (done) => {
      storage.get()
        .then(() => {
          test.expect(paths.ensureJSON).to.have.been.called()
          test.expect(paths.ensureJSON).to.have.been.calledWith(mocks.storage.options.fileName)
          done()
        })
    })

    test.it('should ensure data has been read from file', (done) => {
      storage.get()
        .then(() => {
          test.expect(paths.readJSON).to.have.been.called()
          test.expect(paths.readJSON).to.have.been.calledWith(mocks.storage.options.fileName)
          done()
        })
    })

    test.it('should read data from file only first time it is invoqued', (done) => {
      storage.get()
        .then(() => {
          storage.get()
            .then(() => {
              test.expect(paths.readJSON).to.have.been.calledOnce()
              done()
            })
        })
    })

    test.it('should return the value of the received key, if it is not an object', (done) => {
      let dataKey = 'fooString'
      storage.get(dataKey)
        .then((value) => {
          test.expect(JSON.stringify).not.to.have.been.called()
          test.expect(value).to.equal(mocks.storage.data[dataKey])
          done()
        })
    })

    testClonedByType('should return a clone of the value for the received key, if it is an object', 'fooObject')
    testClonedByType('should return a clone of the value for the received key, if it is an array', 'fooObjectsArray')

    test.it('should return a clone of all data if no key is received', (done) => {
      storage.get()
        .then((value) => {
          test.expect(JSON.stringify).to.have.been.calledWith(mocks.storage.data)
          test.expect(value).to.deep.equal(mocks.storage.data)
          done()
        })
    })

    test.it('should reject the promise with a Bad Data error if the key does not exists in the data', (done) => {
      storage.get('wrongKey')
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(errors.BadData)
          done()
        })
    })
  })

  test.describe('set', () => {
    test.it('should return a Promise', (done) => {
      let response = storage.set({})
        .then(() => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should ensure data has been read from file', (done) => {
      storage.set({})
        .then(() => {
          test.expect(paths.readJSON).to.have.been.calledWith(mocks.storage.options.fileName)
          done()
        })
    })

    test.it('should set full data if no specific key is provided', (done) => {
      const fooData = {
        fooKey: 'fooValue'
      }
      storage.set(fooData)
        .then(() => {
          storage.get()
            .then((data) => {
              test.expect(data).to.deep.equal(fooData)
              done()
            })
        })
    })

    test.it('should set the value in the data received key', (done) => {
      const fooKey = 'fooKey'
      const fooData = ['fooValue1', 'fooValue2']
      storage.set(fooKey, fooData)
        .then(() => {
          storage.get()
            .then((data) => {
              test.expect(data).not.to.equal(fooData)
              test.expect(data[fooKey]).to.deep.equal(fooData)
              done()
            })
        })
    })

    test.it('should return a copy of the set data', (done) => {
      const fooKey = 'fooKey'
      const fooData = ['fooValue1', 'fooValue2']
      storage.set(fooKey, fooData)
        .then((data) => {
          test.expect(JSON.stringify).to.have.been.calledWith(fooData)
          test.expect(data).to.deep.equal(fooData)
          done()
        })
    })

    test.it('should call to save all data after modifying it', (done) => {
      const fooKey = 'fooKey'
      const fooData = {
        fooKey: 'fooValue'
      }
      // init storage with all data
      storage.set(mocks.storage.data)
        .then(() => {
          // set only a key
          storage.set(fooKey, fooData)
            .then(() => {
              // get all data
              storage.get()
                .then((data) => {
                  test.expect(paths.writeJSON).to.have.been.calledWith(
                    mocks.storage.options.fileName,
                    _.extend(mocks.storage.data, {
                      fooKey: fooData
                    })
                  )
                  done()
                })
            })
        })
    })

    test.it('should reject the promise with a Bad Data error if no value is provided', (done) => {
      storage.set()
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(errors.BadData)
          done()
        })
    })

    test.it('should reject the promise with a Bad Data error if a non string key is provided', (done) => {
      storage.set({testing: 'test'}, {})
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(errors.BadData)
          done()
        })
    })
  })

  test.describe('remove', () => {
    test.beforeEach((done) => {
      storage.set(mocks.storage.data)
        .then(() => {
          done()
        })
    })

    test.it('should return a Promise', (done) => {
      let response = storage.remove('key')
        .then(() => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should ensure data has been read from file', (done) => {
      storage.remove('key')
        .then(() => {
          test.expect(paths.readJSON).to.have.been.calledWith(mocks.storage.options.fileName)
          done()
        })
    })

    test.it('should remove the received key from stored data', (done) => {
      const keyToRemove = 'fooObjectsArray'
      storage.set(mocks.storage.data)
        .then(() => {
          storage.remove(keyToRemove)
            .then(() => {
              storage.get()
                .then((data) => {
                  test.expect(mocks.storage.data[keyToRemove]).not.to.be.undefined()
                  test.expect(data[keyToRemove]).to.be.undefined()
                  done()
                })
            })
        })
    })

    test.it('should reject the promise with a Bad Data error if no key is provided', (done) => {
      storage.remove()
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(errors.BadData)
          done()
        })
    })

    test.it('should call to save all data after modifying it', (done) => {
      const mocksCopy = JSON.parse(JSON.stringify(mocks.storage.data))
      const fooKey = 'fooObject'
      storage.remove(fooKey)
        .then(() => {
          // get all data
          storage.get()
            .then((data) => {
              delete mocksCopy[fooKey]
              test.expect(paths.writeJSON).to.have.been.calledWith(
                mocks.storage.options.fileName,
                mocksCopy
              )
              done()
            })
        })
    })

    test.it('should return a copy of all data', (done) => {
      const mocksCopy = JSON.parse(JSON.stringify(mocks.storage.data))
      const fooKey = 'fooObject'
      storage.remove(fooKey)
        .then((data) => {
          delete mocksCopy[fooKey]
          test.expect(JSON.stringify).to.have.been.calledWith(mocksCopy)
          test.expect(data).to.deep.equal(mocksCopy)
          done()
        })
    })
  })
})
