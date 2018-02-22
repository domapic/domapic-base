
const _ = require('lodash')
const path = require('path')

const test = require('../../index')

const serviceArguments = require('../../../lib/arguments/service')

test.describe('arguments -> service', () => {
  const pathsOptions = ['sslCert', 'sslKey']

  const testAbsolutePath = function (optionName) {
    test.describe(optionName + ' path option', () => {
      test.it('should be converted to absolute, if it is relative', () => {
        const fooPath = 'testing'
        const result = serviceArguments[optionName].coerce(fooPath)
        test.expect(result).to.equal(path.resolve(process.cwd(), fooPath))
      })

      test.it('should not be converted, if it is already absolute', () => {
        const fooPath = path.resolve(process.cwd(), 'testing')
        const result = serviceArguments[optionName].coerce(fooPath)
        test.expect(result).to.equal(fooPath)
      })
    })
  }

  _.each(pathsOptions, (optionName) => {
    testAbsolutePath(optionName)
  })
})
