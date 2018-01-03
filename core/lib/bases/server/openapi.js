'use strict'

module.exports = {
  swagger: '2.0',
  info: {
  },
  basePath: '/api',
  tags: [
  ],
  schemes: [
  ],
  paths: {
  },
  components: {
    headers: {
      Allow: {
        allow: {
          type: 'string',
          description: 'Supported request methods'
        }
      }
    },
    responses: {
      Error: {
        type: 'object',
        properties: {
          statusCode: {
            description: 'Error HTML status code',
            type: 'integer',
            format: 'int32'
          },
          error: {
            description: 'Error name',
            type: 'string'
          },
          message: {
            description: 'message',
            type: 'string'
          }
        }
      }
    }
  },
  definitions: {
  }
}
