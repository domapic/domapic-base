'use strict'

const _ = require('lodash')
const Boom = require('boom')

const Errors = function () {
  const errors = {
    BadImplementation: {
      name: 'Bad Implementation', // Generic error
      toCode: 500,
      fromCode: 500
    },
    ChildProcess: {
      name: 'Child Process', // Error in child process
      toCode: 500
    },
    FileSystem: {
      name: 'File System', // File system error
      toCode: 500
    },
    NotImplemented: {
      name: 'Not Implemented', // Method not implemented
      toCode: 501,
      fromCode: 501
    },
    BadData: {
      name: 'Bad Data', // Provided bad data to the function
      toCode: 422,
      fromCode: 422
    },
    TimeOut: {
      name: 'Time Out', // Timed out
      toCode: 408
    },
    ClientTimeOut: {
      name: 'Client Time Out', // Client request timed out
      toCode: 408,
      fromCode: 408
    },
    BadGateway: {
      name: 'Bad Gateway', // Bad Gateway
      toCode: 502,
      fromCode: 502
    },
    GatewayTimeOut: {
      name: 'Gateway Time Out', // Gateway
      toCode: 504,
      fromCode: 504
    },
    Forbidden: {
      name: 'Forbidden', // Authorization failed
      toCode: 403,
      fromCode: 403
    },
    Unauthorized: {
      name: 'Unauthorized', // Authentication failed
      toCode: 401,
      fromCode: 401
    },
    NotFound: {
      name: 'Not Found', // Not found in database, etc..
      toCode: 404,
      fromCode: 404
    },
    Conflict: {
      name: 'Conflict', // Tried to update a field with an existing uniq id, for example
      toCode: 409,
      fromCode: 409
    },
    ServerUnavailable: {
      name: 'Server Unavailable', // Client request to server unavailable
      toCode: 503,
      fromCode: 503
    },
    MethodNotAllowed: {
      name: 'Method Not Allowed', // Wrong HTTP method on client request
      toCode: 405,
      fromCode: 405
    }
  }

  const ErrorFactory = function (name, constructorName) {
    const ErrorConstructor = function (message, stack, extraData) {
      this.message = message
      this.name = name
      this.typeof = constructorName
      this.isDomapic = true
      this.stack = stack || (new Error()).stack
      this.extraData = extraData
    }

    ErrorConstructor.prototype = Object.create(Error.prototype)
    ErrorConstructor.prototype.constructor = ErrorConstructor

    return ErrorConstructor
  }

  const createConstructors = function () {
    let constructors = {}
    _.each(errors, (properties, constructorName) => {
      constructors[constructorName] = new ErrorFactory(properties.name, constructorName)
    })
    return constructors
  }

  const byType = createConstructors()

  const FromCode = function (code, message, stack, extraData) {
    let constructorName
    _.each(errors, (properties, errorName) => {
      if (code === properties.fromCode) {
        constructorName = errorName
      }
    })
    return (constructorName && new byType[constructorName](message, stack, extraData)) || new Error(message)
  }

  const toHTML = function (error) {
    const statusCode = error.typeof && errors[error.typeof] ? errors[error.typeof].toCode : 500
    return Boom.boomify(error, { statusCode: statusCode })
  }

  const isControlled = function (error) {
    return !!error.isDomapic
  }

  return _.extend(byType, {
    isControlled: isControlled,
    FromCode: FromCode,
    toHTML: toHTML
  })
}

module.exports = Errors
