
const requestPromise = require('request-promise')

const test = require('./test/unit/index')

test.describe('Open Api', function () {
  test.describe('/api/openapi.json', function () {
    let openapi

    test.beforeEach(() => {
      return requestPromise({
        method: 'GET',
        url: 'http://service:3000/api/openapi.json',
        json: true
      }).then((response) => {
        openapi = response
      })
    })

    test.it('should return info about the /about api', () => {
      return test.expect(openapi.paths).to.have.property('/about')
      // TODO, test the structure deeper
    })

    test.it('should return info about the /config api', () => {
      return test.expect(openapi.paths).to.have.property('/config')
      // TODO, test the structure deeper
    })

    test.it('should return the openapi version', () => {
      return test.expect(openapi.openapi).to.equal('3.0.0')
    })
    // TODO, check info, should be equal to package.json info
    // TODO, dynamic calls to api using openapi
    // TODO, send openapi to an openapi validation service
  })
})
