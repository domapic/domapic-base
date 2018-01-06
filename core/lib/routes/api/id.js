
const Promise = require('bluebird')

module.exports = {
  openApi: {
    tags: [{
      name: 'id',
      description: 'Domapic service identifier'
    }],
    schemas: {
      Id: {
        description: 'Unique identifier of the service',
        type: 'object',
        properties: {
          name: {
            description: 'Name of the service',
            type: 'string'
          }
        },
        required: ['name'],
        example: {
          name: 'domapic-controller'
        }
      }
    },
    paths: {
      '/id': {
        get: {
          tags: [
            'id'
          ],
          'x-json-content-schema': {
            '$ref': '#/components/schemas/Id'
          },
          summary: 'Returns unique and constant data of the service',
          description: 'Returns a map with unique and constant data that allows to identify the service',
          operationId: 'getId'
        },
        put: {
          'x-json-content-schema': {
            '$ref': '#/components/schemas/Id'
          },
          summary: 'Modify id',
          description: 'Returns a map of status codes to quantities',
          operationId: 'putId',
          tags: [
            'id'
          ]
        }
      },
      '/id/:name': {
        get: {
          'x-json-content-schema': {
            '$ref': '#/components/schemas/Id'
          },
          summary: 'Returns unique and constant data of the service',
          description: 'Returns a map with unique and constant data that allows to identify the service',
          operationId: 'getIdName',
          tags: [
            'id'
          ],
          // Get as is
          parameters: [
            {
              name: 'name',
              in: 'path',
              description: 'service name',
              required: true,
              example: 'service-name-example',
              schema: {
                type: 'string'
              }
            }
          ]
        }
      }
    }
  },
  operations: {
    getId: {
      parse: {
        params: {
          id: (id) => {
            return Number(id)
          }
        }
      },
      // TODO, pass parameters/body as in openapi doc?
      // TODO, avoid core here ?
      handler: (parameters, response, core) => {
        return Promise.resolve({
          name: 'testing get'
        })
      }
    },
    putId: {
      handler: (parameters, response, core) => {
        return {
          name: 'testing put'
        }
      }
    },
    patchtId: {
      handler: (parameters, response, core) => {
        return {
          name: 'testing patch'
        }
      }
    },
    getIdName: {
      handler: (parameters, response, core) => {
        return parameters
      }
    }
  }
}
