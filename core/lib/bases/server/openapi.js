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
        type: 'string',
        description: 'Supported request methods'
      },
      ContentLocation: {
        type: 'string',
        description: 'Indicates an alternate location for the returned data'
      }
    },
    responses: {
      Options: {
        description: 'OpenApi spec for each supported method',
        required: ['options'],
        type: 'object',
        properties: {
          get: {
            type: 'object',
            description: 'OpenApi spec for get method'
          },
          patch: {
            type: 'object',
            description: 'OpenApi spec for patch method'
          },
          post: {
            type: 'object',
            description: 'OpenApi spec for post method'
          },
          put: {
            type: 'object',
            description: 'OpenApi spec for put method'
          },
          options: {
            type: 'object',
            description: 'OpenApi spec for options method'
          }
        }
      },
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
