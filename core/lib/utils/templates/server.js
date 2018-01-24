'use strict'

// TODO, review unused templates

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
  operationIdNotFoundError: 'Operation to execute with id {{operationId}} not found',
  noOperationIdError: 'No operation id provided for {{method}} in {{path}}',
  responseStatusNotAllowedError: 'Method {{methodToUse}} can´t send a {{statusCode}} status code. Please use one of {{comma-separated allowedStatusCodes}}',

  serverStarted: 'Server started and listening at port {{port}}',
  serverOptionsLogTitle: 'Server options: ',

  requestIdLog: '{{req.url}} | {{req.id}}',

  receivedRequestTitleLog: 'Received Request {{req.method}} |',
  receivedRequestLog: '{{req.ip}} |',
  requestHeadersTitleLog: 'Request headers |',
  requestInfoTitleLog: 'Request info |',
  requestParamsLog: '\nParams: {{toJSON req.params}}',
  requestBodyLog: '\nBody: {{toJSON req.body}}',
  requestQueryLog: '\nQuery: {{toJSON req.query}}',

  sendResponseTitleLog: 'Send Response |',
  sendResponseLog: '{{{res.statusCode}}} |',
  responseHeadersTitleLog: 'Response headers |',
  responseContentTitleLog: 'Response Content | {{{type}}} |',
  responseContentLog: '\nContent: {{toJSON response}}',
  responseTemplateLog: '\nTemplate: {{template}}',

  authenticationRequiredError: 'Authentication required. {{capitalize message}}',
  authenticationHeadersNotFoundError: 'Authentication headers not found',
  authorizationFailedError: 'Not authorized',
  wrongAuthenticationMethod: 'Authentication method "{{method}}" not supported. Supported methods are: {{comma-separated supported}}',
  invalidApiKeyError: 'Invalid Api Key',
  malFormedAuthenticationMethodError: 'Authentication method "{{method}}" is malformed',
  disabledAuthenticationRequest: 'Request authentication disabled | {{req.ip}} | {{req.id}}'
}
