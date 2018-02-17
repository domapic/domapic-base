
const _ = require('lodash')
const Boom = require('boom')

const test = require('../../../index')

const Errors = require('../../../../lib/bases/core/Errors')

test.describe('Bases -> Core -> Errors', () => {
  const staticMethods = ['FromCode', 'toHTML', 'isControlled']
  const errors = new Errors()

  _.each(errors, (Method, methodName) => {
    if (staticMethods.indexOf(methodName) < 0) {
      test.describe(methodName, () => {
        test.it('should return an Error constructor', () => {
          const error = new Method('fooMessage')
          test.expect(error).to.be.an.instanceof(Error)
        })

        test.it('should return an error with the message received', () => {
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

  test.describe('fromCode', () => {
    test.it('should return an error using the constructor related to the provided code', () => {
      const error = new errors.FromCode(501, 'fooMessage')
      test.expect(error.typeof).to.equal('NotImplemented')
    })

    test.it('should return a generic error if provided code is not related to any custom constructor', () => {
      const error = new errors.FromCode(1203, 'fooMessage')
      test.expect(error.isDomapic).to.be.undefined()
      test.expect(error.typeof).to.be.undefined()
    })
  })

  test.describe('toHTML', () => {
    test.it('should return a Boomified version of the provided error', () => {
      const error = new errors.BadData('')
      const htmlError = errors.toHTML(error)
      test.expect(Boom.isBoom(htmlError)).to.be.true()
      test.expect(htmlError.output.payload.statusCode).to.equal(422)
    })

    test.it('should return a Boomified version of a 500 error if the provided error is not related to any custom constructor', () => {
      const error = new Error('')
      const htmlError = errors.toHTML(error)
      test.expect(Boom.isBoom(htmlError)).to.be.true()
      test.expect(htmlError.output.payload.statusCode).to.equal(500)
    })
  })

  test.describe('isControlled', () => {
    test.it('should return true if the provided error was created using custom constructors', () => {
      const error = new errors.BadData('')
      test.expect(errors.isControlled(error)).to.be.true()
    })

    test.it('should return false if the provided error was not created using custom constructors', () => {
      const error = new Error('')
      test.expect(errors.isControlled(error)).to.be.false()
    })
  })
})
