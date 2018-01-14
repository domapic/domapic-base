
const Promise = require('bluebird')

const Operations = function (core) {
  return {
    getId: {
      auth: (userData) => {
        console.log('getId')
        console.log(userData) // Includes rol and username
        throw new Error('Not allowed')// Or promise.reject
      },
      handler: () => {
        return Promise.resolve({
          name: 'testing get'
        })
      }
    },
    patchId: {
      auth: (userData) => {
        console.log('patchId')
        console.log(userData) // Includes rol and username
        return false // or Promise.reject
      },
      handler: (parameters, requestBody, response) => {
        console.log(parameters)
        console.log(requestBody)
        response.status(204)
        return Promise.resolve()
      }
    },
    postId: {
      auth: (userData) => {
        console.log('patchId')
        console.log(userData) // Includes rol and username
        return Promise.resolve() // Or promise.resolve
      },
      handler: (parameters, requestbody, response) => {
        console.log(parameters)
        console.log(requestbody)
        response.status(201)
        response.header('content-location', 'testing')
        return Promise.resolve()
      }
    },
    getIdName: {
      parse: {
        params: {
          name: (id) => {
            return Number(id)
          }
        }
      },
      auth: (userData) => {
        console.log('getIdName')
        console.log(userData) // Includes rol and username
        return true
      },
      handler: (parameters, requestbody, response) => {
        console.log(parameters)
        return parameters
      }
    }
  }
}

module.exports = Operations
