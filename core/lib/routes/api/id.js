
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
        additionalProperties: false,
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
          operationId: 'getId',
          security: [{
            jwt: []
          }]
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
      authorization: (userData) => {
        // credentials should be username, or apikey (core security methods returns it)
        console.log('getId')
        console.log(userData) // Includes rol and username
        throw new Error('Not allowed')// Or promise.resolve
      },
      // TODO, pass parameters/body as in openapi doc?
      // TODO, avoid core here ? Yes
      // TODO, instead of response, use "resHeaders", or something similar
      handler: (parameters, response, core) => {
        return Promise.resolve({
          name: 'testing get'
        })
      }
    },
    putId: {
      authorization: (userData) => {
        // credentials should be username, or apikey (core security methods returns it)
        console.log('putId')
        console.log(userData) // Includes rol and username
        return Promise.resolve() // Or promise.resolve
      },
      handler: (parameters, response, core) => {
        return {
          name: 'testing put'
        }
      }
    },
    patchtId: {
      authorization: (userData) => {
        // credentials should be username, or apikey (core security methods returns it)
        console.log('patchId')
        console.log(userData) // Includes rol and username
        return Promise.resolve() // Or promise.resolve
      },
      handler: (parameters, response, core) => {
        return {
          name: 'testing patch'
        }
      }
    },
    getIdName: {
       authorization: (userData) => {
        // credentials should be username, or apikey (core security methods returns it)
        console.log('getIdName')
        console.log(userData) // Includes rol and username
        return true // Or promise.resolve
      },
      handler: (parameters, response, core) => {
        return parameters
      }
    }
  }
}
