
const test = require('mocha-sinon-chai')

const index = require('../../index.js')
const Service = require('../../lib/Service')
const cli = require('../../lib/cli')
const utils = require('../../lib/utils')

test.describe('Index', () => {
  test.it('should return the Service constructor', () => {
    test.expect(index.Service).to.deep.equal(Service)
  })

  test.it('should return the cli method', () => {
    test.expect(index.cli).to.deep.equal(cli)
  })

  test.it('should return the utils object', () => {
    test.expect(index.utils).to.deep.equal(utils)
  })
})
