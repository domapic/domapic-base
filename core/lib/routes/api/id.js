
const Promise = require('bluebird')

module.exports = {
 // auth: true,
  method: 'GET',
  route: '/id',
/*  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      age: {
        type: 'number',
        minimum: 18,
        maximum: 90
      },
      telephone: {
        type: 'string',
        pattern: '^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$'
      },
      email: {
        type: 'string',
        format: 'email'
      }
    },
    required: ['name', 'age']
  }, */
  handler: (req) => {
    return Promise.resolve({
      name: 'testing'
    })
  }
}
