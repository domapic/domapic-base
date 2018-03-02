
const Promise = require('bluebird')
const requestPromise = require('request-promise')

const test = require('./test/unit/index')

test.describe('Microservice', function () {
  let requestOptions = {}

  test.beforeEach(() => {
    requestOptions = {
      method: 'GET',
      url: 'http://service:3000/api/config',
      json: true
    }
  })

  test.it('should be running', () => {
    requestOptions.resolveWithFullResponse = true
    return requestPromise(requestOptions).then((response) => {
      return test.expect(response.statusCode).to.equal(200)
    })
  })

  test.describe('Config api', function () {
    test.it('should return the port and color configuration', () => {
      return requestPromise(requestOptions).then((response) => {
        return Promise.all([
          test.expect(response.port).to.equal(3000),
          test.expect(response.color).to.equal(true)
        ])
      })
    })
  })
})
