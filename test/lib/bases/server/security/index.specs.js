
const test = require('../../../../index')
const mocks = require('../../../../mocks')

const SecurityMethods = require('../../../../../lib/bases/server/security')

test.describe('Bases -> Server -> SecurityMethods', () => {
  let securityMethods,
    stubCore

  test.beforeEach(() => {
    stubCore = new mocks.core.Stub()
    securityMethods = new SecurityMethods(stubCore)
  })

  test.it('Should return a new jwt method instance', () => {
    test.expect(securityMethods).to.have.property('jwt')
    test.expect(securityMethods.jwt).to.have.property('openApi')
  })

  test.it('Should return a new apiKey method instance', () => {
    test.expect(securityMethods).to.have.property('apiKey')
    test.expect(securityMethods.apiKey).to.have.property('openApi')
  })
})
