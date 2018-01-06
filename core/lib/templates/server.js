'use strict'

module.exports = {
  routerAlreadyInitializedError: 'Router was already initialized. It is not possible to add more routes to it',
  methodNotAllowedError: 'Wrong method {{method}}',
  bodyPropertiesValidationError: '{{property}}: {{{message}}}',
  bodyEmptyValidationError: 'Request body is required',
  resourceNotFoundError: 'Resource not found',
  processRequestError: 'Error processing request |',
  processRequestControlledError: 'Controlled error | {{{message}}} |',
  errorStackLog: 'Error stack | {{{message}}} |',
  invalidOptionsError: 'Invalid server options. {{{message}}}',
  noSslCertError: 'Provided sslKey, but not sslCert',
  noSslKeyError: 'Provided sslCert, but not sslKey',
  noPortError: 'No port provided',
  portInUseError: 'Port {{port}} is already in use',
  portDeniedError: 'Permission denied to use port {{port}}',
  serverStartedError: 'Server was already started',
  apiAlreadyExistsError: 'Api {{item}} {{name}} already exists',
  noHandlerDefinedError: 'Action to execute with id {{actionid}} not found',
  responseStatusNotAllowedError: 'Method {{methodToUse}} can´t send a {{statusCode}} status code. Please use one of {{comma-separated allowedStatusCodes}}',

  serverStarted: 'Server started and listening at port {{port}}',
  serverOptionsLogTitle: 'Server options: ',

  requestIdLog: '{{req.url}} | {{req.id}}',

  receivedRequestTitleLog: 'Received {{req.method}} |',
  receivedRequestLog: '{{req.ip}} |',
  requestHeadersTitleLog: 'Request headers |',
  requestInfoTitleLog: 'Request info |',
  requestParamsLog: '\nParams: {{toJSON req.params}}',
  requestBodyLog: '\nBody: {{toJSON req.body}}',
  requestQueryLog: '\nQuery: {{toJSON req.query}}',

  sendResponseTitleLog: 'Send response |',
  sendResponseLog: '{{{res.statusCode}}} |',
  responseHeadersTitleLog: 'Response headers |',
  responseContentTitleLog: 'Response Content | {{{type}}} |',
  responseContentLog: '\nContent: {{toJSON response}}',
  responseTemplateLog: '\nTemplate: {{template}}'
}
