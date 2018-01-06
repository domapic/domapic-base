'use strict'

module.exports = {
  get: {
    '200': {
      description: 'Sucessful response',
      responseContent: true
    }
  },
  delete: {
    '204': {
      responseContent: false
    }
  },
  put: {
    requestBody: true,
    '204': {
      description: 'Entity updated',
      responseContent: false
    },
    '201': {
      description: 'New entity added',
      responseContent: true,
      headers: ['Content-Location']
    },
    '422': {
      description: 'Bad data provided',
      responseContent: true
    }
  },
  patch: {
    requestBody: true,
    '204': {
      description: 'Entity updated',
      responseContent: false
    },
    '422': {
      description: 'Bad data provided',
      responseContent: true
    }
  },
  post: {
    requestBody: true,
    '201': {
      description: 'New entity added',
      responseContent: false,
      headers: ['Content-Location']
    },
    '422': {
      description: 'Bad data provided',
      responseContent: true
    }
  },
  options: {
    '200': {
      description: 'Sucessful response',
      responseContent: true,
      headers: ['Allow']
    }
  }
}
