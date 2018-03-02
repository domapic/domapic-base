
const _ = require('lodash')
const Promise = require('bluebird')
const requestPromise = require('request-promise')

const test = require('./test/unit/index')

test.describe('Built-in API', function () {
  const BASE_URL = 'http://service:3000/api/'
  let requestOptions = {}

  const testOptionsMethod = function (options) {
    test.describe('OPTIONS', function () {
      test.it('should return all info about the api resource', () => {
        requestOptions.method = 'OPTIONS'
        return requestPromise(requestOptions).then((response) => {
          // TODO, check the response with the openapi definition of the resource
          return Promise.all([
            test.expect(response.get.summary).to.equal(options.summary),
            test.expect(response.options.summary).to.equal('Api resource self-description')
          ])
        })
      })
    })
  }

  test.beforeEach(() => {
    requestOptions = {
      method: 'GET',
      url: BASE_URL + '/about',
      json: true
    }
  })

  test.it('should be running', () => {
    requestOptions.resolveWithFullResponse = true
    return requestPromise(requestOptions).then((response) => {
      return test.expect(response.statusCode).to.equal(200)
    })
  })

  test.describe('/api/about', function () {
    test.describe('GET', function () {
      test.it('should return all info about the service', () => {
        return requestPromise(requestOptions).then((response) => {
          return Promise.all([
            test.expect(response.name).to.equal('service'),
            test.expect(response.type).to.equal('unrecognized'),
            test.expect(response.package).to.equal('service'),
            test.expect(response.version).to.equal('1.0.0'),
            test.expect(response.description).to.equal('Microservice starter for integration tests')
          ])
        })
      })
    })

    testOptionsMethod({
      summary: 'Returns service info'
    })
  })

  test.describe('/api/config', function () {
    test.beforeEach(() => {
      requestOptions.url = BASE_URL + 'config'
    })

    test.describe('GET', function () {
      test.it('should return current saved configuration, extended with explicit service options', () => {
        return requestPromise(requestOptions).then((response) => {
          const savedConfig = require('./config/.domapic/service/config/service.json')
          const explicitOptions = require('./explicitOptions.fixtures.json')
          return test.expect(response).to.deep.equal(_.extend({}, savedConfig, explicitOptions))
        })
      })
    })

    testOptionsMethod({
      summary: 'Returns current configuration'
    })
  })
})
