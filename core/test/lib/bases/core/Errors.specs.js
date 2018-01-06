
const _ = require('lodash')

const test = require('../../../index')

const Errors = require('../../../../lib/bases/core/Errors')

test.describe('Bases -> Core -> Errors', () => {
  const staticMethods = ['fromCode', 'toHTML', 'isControlled']
  const errors = new Errors()

  _.each(errors, (Method, methodName) => {
    if (staticMethods.indexOf(methodName) < 0) {
      test.describe(methodName, () => {
        test.it('should return an Error constructor', () => {
          const error = new Method('fooMessage')
          test.expect(error).to.be.an.instanceof(Error)
        })

        test.it('should return an Error with the message received', () => {
          const message = 'fooMessage'
          const error = new Method(message)
          test.expect(error.message).to.equal(message)
        })

        test.it('should return the received stack, if passed', () => {
          const customError = new Error('fooError')
          const error = new Method('fooMessage', customError.stack)
          test.expect(error.stack).to.equal(customError.stack)
        })
      })
    }
  })
})
