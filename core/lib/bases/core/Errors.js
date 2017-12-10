'use strict'

const _ = require('lodash')

const Errors = function () {
  const errors = {
    BadImplementation: {
      name: 'Bad Implementation', // Generic error
      toCode: '500',
      fromCode: '500'
    },
    ChildProcess: {
      name: 'Child Process', // Error in child process
      toCode: '500'
    },
    FileSystem: {
      name: 'File System', // File system error
      toCode: '500'
    },
    NotImplemented: {
      name: 'Not Implemented', // Method not implemented
      toCode: '501',
      fromCode: '501'
    },
    BadData: {
      name: 'Bad Data', // Provided bad data to the function
      toCode: '422',
      fromCode: '422'
    },
    TimeOut: {
      name: 'Time Out', // Timed out
      toCode: '408',
      fromCode: '408'
    },
    ClienTimeOut: {
      name: 'Client Time Out', // Client request timed out
      toCode: '408'
    },
    Forbidden: {
      name: 'Forbidden', // Repiting it has no sense, always will be forbidden
      toCode: '403',
      fromCode: '403'
    },
    Unauthorized: {
      name: 'Unauthorized', // Not allowed without authorization
      toCode: '401'
    },
    NotFound: {
      name: 'Not Found', // Not found in database, etc..
      toCode: '404',
      fromCode: '404'
    },
    Conflict: {
      name: 'Conflict', // Tried to update a field with an existing uniq id, for example
      toCode: '409',
      fromCode: '409'
    },
    ServerUnavailable: {
      name: 'Server Unavailable', // Client request to server unavailable
      toCode: '503',
      fromCode: '503'
    },
    MethodNotAllowed: {
      name: 'Method Not Allowed', // Wrong HTTP method on client request
      toCode: '405'
    }
  }

  const ErrorFactory = function (name) {
    const ErrorConstructor = function (message) {
      this.message = message
      this.name = name
    }

    ErrorConstructor.prototype = Object.create(Error.prototype)

    return ErrorConstructor
  }

  const createConstructors = function () {
    let constructors = {}
    _.each(errors, (properties, constructorName) => {
      constructors[constructorName] = new ErrorFactory(properties.name)
    })
    return constructors
  }

  const fromCode = function (code) {
    // TODO, convert to constructor from code, returns constructor
  }

  const toCode = function (/* error */) {
    // TODO, returns the code correspondant to the used constructor
  }

  const toHTML = function () {
    // TODO, returns an HTML error ready for response (maybe boom)
    // maybe set the status directly... depends on server technology
  }

  const byType = createConstructors()

  return _.extend(byType, {
    fromCode: fromCode,
    toCode: toCode,
    toHTML: toHTML
  })
}

module.exports = Errors
