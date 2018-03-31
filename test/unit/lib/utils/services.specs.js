
const test = require('mocha-sinon-chai')

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

  test.describe('commandUrl', () => {
    test.it('should return the url for the provided command name', () => {
      test.expect(services.commandUrl('fooCommand')).to.equal('commands/foo-command')
    })
  })

  test.describe('eventUrl', () => {
    test.it('should return the url for the provided event name', () => {
      test.expect(services.eventUrl('foo_Event')).to.equal('events/foo-event')
    })
  })

  test.describe('stateUrl', () => {
    test.it('should return the url for the provided event name', () => {
      test.expect(services.stateUrl('Foo-state')).to.equal('states/foo-state')
    })
  })

  test.describe('servicesUrl', () => {
    test.it('should return the url for services', () => {
      test.expect(services.servicesUrl()).to.equal('services')
    })
  })

  test.describe('serviceUrl', () => {
    test.it('should return the url for the provided service name', () => {
      test.expect(services.serviceUrl('foo_Service')).to.equal('services/foo-service')
    })
  })

  test.describe('serviceEventUrl', () => {
    test.it('should return the url for the provided event of the provided service name', () => {
      test.expect(services.serviceEventUrl('FooService', 'foo_Event')).to.equal('services/foo-service/events/foo-event')
    })
  })
})
