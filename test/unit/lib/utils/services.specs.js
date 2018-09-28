
const test = require('narval')

const services = require('../../../../lib/utils/services')

test.describe('Utils -> services', () => {
  test.describe('serviceType', () => {
    const testPackageType = function (options) {
      test.it(options.description, () => {
        test.expect(services.serviceType(options.packageName)).to.equal(options.expectedResult)
      })
    }

    testPackageType({
      description: 'should be "service" if package name matchs with the services regex',
      packageName: 'foo-service',
      expectedResult: 'service'
    })

    testPackageType({
      description: 'should be "controller" if package name matchs with the controller regex',
      packageName: 'foo-controller',
      expectedResult: 'controller'
    })

    testPackageType({
      description: 'should be "plugin" if package name matchs with the controller regex',
      packageName: 'foo-plugin',
      expectedResult: 'plugin'
    })

    testPackageType({
      description: 'should be "unrecognized" if package name doesn´t matchs any recognized type',
      packageName: 'foo',
      expectedResult: 'unrecognized'
    })
  })

  test.describe('normalizeName', () => {
    test.it('should return a kebabCase version of the provided name', () => {
      const expectedResult = 'foo-bar'
      test.expect(services.normalizeName('Foo Bar')).to.equal(expectedResult)
      test.expect(services.normalizeName('fooBar')).to.equal(expectedResult)
      test.expect(services.normalizeName('__FOO_BAR__')).to.equal(expectedResult)
    })
  })
})
