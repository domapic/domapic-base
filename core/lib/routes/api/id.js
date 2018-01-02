
const Promise = require('bluebird')

module.exports = {
  openApi: {
    tags: [{
      name: 'id',
      description: 'Domapic service identifier'
    }],
    definitions: {
      Id: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          }
        },
        required: ['name']
      }
    },
    paths: {
      '/id': {
        get: {
          tags: [
            'id'
          ],
          summary: 'Returns unique and constant data of the service',
          description: 'Returns a map with unique and constant data that allows to identify the service',
          operationId: 'getId'
        },
        put: {
          operationId: 'putId',
          tags: [
            'id'
          ],
          summary: 'Returns pet inventories by status',
          description: 'Returns a map of status codes to quantities',
          parameters: [{
            in: 'body',
            name: 'body',
            description: 'Modify the id of the service',
            required: true,
            schema: {
              '$ref': '#/definitions/Id'
            }
          }]
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
    }
  }
}
