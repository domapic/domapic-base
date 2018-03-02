
const fs = require('fs')
const os = require('os')
const path = require('path')

const _ = require('lodash')
const Promise = require('bluebird')
const fsExtra = require('fs-extra')

const test = require('../../../index')
const mocks = require('../../../mocks')

const Paths = require('../../../../../lib/bases/core/Paths')
const Errors = require('../../../../../lib/bases/core/Errors')

test.describe('Bases -> Core -> Paths', () => {
  let paths
  let fooHome = '/fooHome'
  let readStub
  let errors

  test.beforeEach(() => {
    readStub = test.sinon.stub(fsExtra, 'readJSON')
    test.sinon.stub(fsExtra, 'ensureFile').usingPromise(Promise).resolves()
    test.sinon.stub(fsExtra, 'ensureDir').usingPromise(Promise).resolves()
    test.sinon.stub(fsExtra, 'writeJSON').usingPromise(Promise).resolves()
    test.sinon.stub(os, 'homedir').returns(fooHome)
    errors = new Errors()
    paths = new Paths(mocks.arguments.options, errors)
  })

  test.afterEach(() => {
    fsExtra.readJSON.restore()
    fsExtra.ensureFile.restore()
    fsExtra.ensureDir.restore()
    fsExtra.writeJSON.restore()
    os.homedir.restore()
  })

  test.describe('Constructor', () => {
    test.it('should throw a Bad Data error if no name is provided', () => {
      let error
      let paths
      try {
        paths = new Paths({}, errors)
      } catch (err) {
        error = err
      }
      test.expect(paths).to.equal(undefined)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })
  })

  test.describe('ensureDir', () => {
    test.it('should return a Promise', (done) => {
      let response = paths.ensureDir('fooDir')
        .then((dir) => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    const testEnsureDir = function (description, subDir, customPathsOptions) {
      let optionsforPaths
      let localPaths

      test.beforeEach(() => {
        if (customPathsOptions) {
          optionsforPaths = customPathsOptions
          localPaths = new Paths(customPathsOptions)
        } else {
          optionsforPaths = mocks.arguments.options
          localPaths = paths
        }
      })

      test.it(description, (done) => {
        let resolvedSubDir = _.isArray(subDir) ? subDir.join('/') : subDir
        let resolvedPath = path.resolve(optionsforPaths.path, '.domapic', optionsforPaths.name, resolvedSubDir)
        localPaths.ensureDir(subDir)
          .then((dir) => {
            test.expect(fsExtra.ensureDir).to.have.been.called()
            test.expect(fsExtra.ensureDir).to.have.been.calledWith(resolvedPath)
            test.expect(dir).to.equal(resolvedPath)
            done()
          })
      })
    }
    testEnsureDir('should ensure that the resolved provided path exists', 'fooDir')
    testEnsureDir('should ensure that the resolved provided array of paths exists', ['fooDir', 'fooDir2'])
    testEnsureDir('should have the same behavior when option path provided to the constructor is relative', 'fooDir', {
      name: mocks.arguments.options.name,
      path: 'fooRelativePath'
    })

    test.it('should resolve the base path from homeDir when option path is not provided to the constructor', (done) => {
      let subDir = 'fooSubdir'
      let resolvedPath = path.resolve(fooHome, '.domapic', mocks.arguments.options.name, subDir)
      paths = new Paths({
        name: mocks.arguments.options.name
      })
      paths.ensureDir(subDir)
          .then((dir) => {
            test.expect(fsExtra.ensureDir).to.have.been.called()
            test.expect(fsExtra.ensureDir).to.have.been.calledWith(resolvedPath)
            test.expect(dir).to.equal(resolvedPath)
            done()
          })
    })

    test.it('should not resolve the base path more than one time, when called multiple times', (done) => {
      let subDir = 'fooSubdir'
      paths = new Paths({
        name: mocks.arguments.options.name
      })
      paths.ensureDir(subDir)
          .then(() => {
            paths.ensureDir(subDir)
              .then((dir) => {
                test.expect(os.homedir).to.have.been.calledOnce()
                done()
              })
          })
    })
  })

  test.describe('ensureFile', () => {
    test.it('should return a Promise', (done) => {
      let response = paths.ensureFile('fooFile')
        .then((dir) => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should ensure that the resolved provided file exists', (done) => {
      let fooFile = 'fooFile'
      let resolvedFile = path.resolve(mocks.arguments.options.path, '.domapic', mocks.arguments.options.name, fooFile)
      paths.ensureFile(fooFile)
        .then((file) => {
          test.expect(fsExtra.ensureFile).to.have.been.called()
          test.expect(fsExtra.ensureFile).to.have.been.calledWith(resolvedFile)
          test.expect(file).to.equal(resolvedFile)
          done()
        })
    })
  })

  test.describe('writeJSON', () => {
    test.it('should return a Promise', (done) => {
      let response = paths.writeJSON('fooFile', {})
        .then((dir) => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should ensure that the resolved provided file exists', (done) => {
      let fooFile = 'fooFile'
      let resolvedFile = path.resolve(mocks.arguments.options.path, '.domapic', mocks.arguments.options.name, fooFile)
      paths.writeJSON(fooFile, {})
        .then((file) => {
          test.expect(fsExtra.ensureFile).to.have.been.called()
          test.expect(fsExtra.ensureFile).to.have.been.calledWith(resolvedFile)
          done()
        })
    })

    test.it('should write the provided JSON in the resolved provided path', (done) => {
      let fooFile = 'fooFile'
      let fooJSON = {foo: 'foo'}
      let resolvedFile = path.resolve(mocks.arguments.options.path, '.domapic', mocks.arguments.options.name, fooFile)
      paths.writeJSON(fooFile, fooJSON)
        .then((file) => {
          test.expect(fsExtra.writeJSON).to.have.been.called()
          test.expect(fsExtra.writeJSON).to.have.been.calledWith(resolvedFile, fooJSON)
          done()
        })
    })
  })

  test.describe('readJSON', () => {
    test.it('should return a Promise', (done) => {
      let response = paths.readJSON('fooFile')
        .then((dir) => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should read the resolved provided file path as a JSON', (done) => {
      let fooFile = 'fooFile'
      let fooJSON = {
        foo: 'foo'
      }
      let resolvedFile = path.resolve(mocks.arguments.options.path, '.domapic', mocks.arguments.options.name, fooFile)
      paths.readJSON(fooFile)
        .then((json) => {
          test.expect(fsExtra.readJSON).to.have.been.called()
          test.expect(fsExtra.readJSON).to.have.been.calledWith(resolvedFile)
          test.expect(json).to.equal(fooJSON)
          done()
        })
      readStub.resolves(fooJSON)
    })

    test.it('should reject the promise with a Bad Data error if reading JSON returns an error', (done) => {
      let fooFile = 'fooFile'
      paths.readJSON(fooFile)
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(errors.BadData)
          done()
        })
      readStub.rejects(new Error())
    })
  })

  test.describe('ensureJSON', () => {
    let existsStub
    test.beforeEach(() => {
      existsStub = test.sinon.stub(fs, 'existsSync')
    })

    test.afterEach(() => {
      fs.existsSync.restore()
    })

    test.it('should return a Promise', (done) => {
      let response = paths.ensureJSON('fooFile')
        .then((dir) => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should resolve the promise if file already exists', (done) => {
      let fooFile = 'fooFile'
      existsStub.returns(true)
      paths.ensureJSON(fooFile)
        .then((json) => {
          test.expect(fsExtra.writeJSON).not.to.have.been.called()
          done()
        })
    })

    test.it('should create the file with an empty JSON if file does not exists', (done) => {
      let fooFile = 'fooFile'
      let resolvedFile = path.resolve(mocks.arguments.options.path, '.domapic', mocks.arguments.options.name, fooFile)
      existsStub.returns(false)
      paths.ensureJSON(fooFile)
        .then((filePath) => {
          test.expect(fsExtra.writeJSON).to.have.been.called()
          test.expect(fsExtra.writeJSON).to.have.been.calledWith(resolvedFile, {})
          test.expect(filePath).to.equal(resolvedFile)
          done()
        })
    })

    test.it('should reject the promise if an error ocurred writing json', (done) => {
      let fooFile = 'fooFile'
      existsStub.returns(false)
      fsExtra.writeJSON.restore()
      test.sinon.stub(fsExtra, 'writeJSON').usingPromise(Promise).rejects()
      paths.ensureJSON(fooFile)
        .catch((error) => {
          test.expect(error).to.be.an.instanceof(Error)
          done()
        })
    })
  })
})
