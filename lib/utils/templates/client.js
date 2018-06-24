'use strict'

module.exports = {
  serverUnavailableError: 'The server {{hostName}} is unavailable',
  unauthorizedError: 'Authentication failed for {{method}} {{url}}',

  sendRequestTitleLog: 'Send {{request.type}}Request {{request.method}} |',
  sendRequestInfoLog: '{{request.url}} | {{request.requestId}}',
  requestBodyLog: '\n Body: {{toJSON request.requestBody}}',

  receivedResponseTitleLog: 'Received {{request.type}}Response {{request.method}} |',
  receivedResponseInfoLog: '{{request.statusCode}} | {{request.url}} | {{request.requestId}} | {{request.responseId}}',
  responseBodyLog: '\n Body: {{toJSON request.responseBody}}',
  requestErrorTitle: 'Request error | ',
  requestErrorMessage: '| {{error.message}}',
  receivedErrorStatus: 'Received error status code {{statusCode}}'
}
