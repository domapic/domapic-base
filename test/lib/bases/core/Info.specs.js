
const path = require('path')

const _ = require('lodash')
const fsExtra = require('fs-extra')

const test = require('../../../index')

const Info = require('../../../../lib/bases/core/Info')
const Errors = require('../../../../lib/bases/core/Errors')
const packageJson = require('../../../../package.json')

const packagePath = path.resolve(__dirname, '..', '..', '..', '..')

test.describe('Bases -> Core -> Info', () => {
  const basePackageInfo = {
    name: 'foo-service',
    version: '1.0.0',
    description: 'fooDescription'
  }
  let errors
  let info

  test.beforeEach(() => {
    errors = new Errors()
    test.sinon.spy(fsExtra, 'readJsonSync')
    info = new Info(packagePath, errors)
  })

  test.afterEach(() => {
    fsExtra.readJsonSync.restore()
  })

  test.describe('Cosntructor', () => {
    test.it('should throw a Bad Data error if no package path is provided', () => {
      let error
      info = null
      try {
        info = new Info(null, errors)
      } catch (err) {
        error = err
      }
      test.expect(info).to.equal(null)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })

    test.it('should throw a Bad Data error if provided package path does not exist', () => {
      let error
      info = null
      try {
        info = new Info('dasddasd', errors)
      } catch (err) {
        error = err
      }
      test.expect(info).to.equal(null)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })

    test.it('Should read the package.json file in the provided package path', () => {
      test.expect(fsExtra.readJsonSync).to.have.been.called.with(path.resolve(packagePath, 'package.json'))
    })
  })

  test.describe('name', () => {
    test.it('Should return the name defined in the provided package.json', () => {
      test.expect(info.name).to.equal(packageJson.name)
    })

    test.it('should throw a Bad Data error if provided package.json have not "name" property', () => {
      fsExtra.readJsonSync.restore()
      test.sinon.stub(fsExtra, 'readJsonSync').returns({
        version: '1.0.0',
        description: 'fooDescription'
      })
      let error
      info = null
      try {
        info = new Info(packagePath, errors)
      } catch (err) {
        error = err
      }
      test.expect(info).to.equal(null)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })
  })

  test.describe('type', () => {
    let readStub

    test.beforeEach(() => {
      fsExtra.readJsonSync.restore()
      readStub = test.sinon.stub(fsExtra, 'readJsonSync')
    })

    test.it('should be "service" if package name matchs with the services regex', () => {
      readStub.returns(basePackageInfo)
      info = new Info(packagePath, errors)
      test.expect(info.type).to.equal('service')
    })

    test.it('should be "controller" if package name matchs with the controller regex', () => {
      readStub.returns(_.extend({}, basePackageInfo, {
        name: 'foo-controller'
      }))
      info = new Info(packagePath, errors)
      test.expect(info.type).to.equal('controller')
    })

    test.it('should be "plugin" if package name matchs with the controller regex', () => {
      readStub.returns(_.extend({}, basePackageInfo, {
        name: 'foo-plugin'
      }))
      info = new Info(packagePath, errors)
      test.expect(info.type).to.equal('plugin')
    })

    test.it('should be "unrecognized" if package name doesn´t matchs any recognized type', () => {
      readStub.returns(_.extend({}, basePackageInfo, {
        name: 'foo'
      }))
      info = new Info(packagePath, errors)
      test.expect(info.type).to.equal('unrecognized')
    })
  })

  test.describe('version', () => {
    test.it('Should return the version defined in the provided package.json', () => {
      test.expect(info.version).to.equal(packageJson.version)
    })

    test.it('should throw a Bad Data error if provided package.json have not "version" property', () => {
      fsExtra.readJsonSync.restore()
      test.sinon.stub(fsExtra, 'readJsonSync').returns({
        name: 'fooName',
        description: 'fooDescription'
      })
      let error
      info = null
      try {
        info = new Info(packagePath, errors)
      } catch (err) {
        error = err
      }
      test.expect(info).to.equal(null)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })
  })

  test.describe('description', () => {
    test.it('Should return the description defined in the provided package.json', () => {
      test.expect(info.description).to.equal(packageJson.description)
    })

    test.it('should throw a Bad Data error if provided package.json have not "description" property', () => {
      fsExtra.readJsonSync.restore()
      test.sinon.stub(fsExtra, 'readJsonSync').returns({
        name: 'fooName',
        version: '1.0.0'
      })
      let error
      info = null
      try {
        info = new Info(packagePath, errors)
      } catch (err) {
        error = err
      }
      test.expect(info).to.equal(null)
      test.expect(error).to.be.an.instanceof(errors.BadData)
    })
  })

  test.describe('homePage', () => {
    test.it('Should return the homepage defined in the provided package.json', () => {
      test.expect(info.homepage).to.equal(packageJson.homepage)
    })

    test.it('should return an empty string if the provided package.json have not "homepage" property', () => {
      fsExtra.readJsonSync.restore()
      test.sinon.stub(fsExtra, 'readJsonSync').returns(basePackageInfo)
      info = new Info(packagePath, errors)
      test.expect(info.homepage).to.equal('')
    })
  })

  test.describe('author', () => {
    test.it('Should return the author defined in the provided package.json', () => {
      test.expect(info.author).to.deep.equal(packageJson.author)
    })

    test.it('should return an empty object if the provided package.json have not "author" property', () => {
      fsExtra.readJsonSync.restore()
      test.sinon.stub(fsExtra, 'readJsonSync').returns(basePackageInfo)
      info = new Info(packagePath, errors)
      test.expect(info.author).to.deep.equal({})
    })
  })

  test.describe('license', () => {
    test.it('Should return the license defined in the provided package.json', () => {
      test.expect(info.license).to.deep.equal(packageJson.license)
    })

    test.it('should return an empty string if the provided package.json have not "license" property', () => {
      fsExtra.readJsonSync.restore()
      test.sinon.stub(fsExtra, 'readJsonSync').returns(basePackageInfo)
      info = new Info(packagePath, errors)
      test.expect(info.license).to.equal('')
    })
  })
})
