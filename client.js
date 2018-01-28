'use strict'

const core = require('./core')

new core.Service()
  .then((service) => {
    const client = new service.client.Connection('http://localhost:8090', {
      apiKey: '8hDjN0Q7ZNKFlVPyzzjpZdju86aT8JuX',
      jwt: {
        userName: 'manolo',
        password: 'testing'
      }
    })
    return client.get('/id')
      .then((response) => {
        console.log('get!')
        console.log(response)
        return client.delete('/id', {
          name: 'testing'
        })
          .then(() => {
            console.log('patched!!')
            return client.post('/id', {name: 'testing-post'})
              .then(() => {
                console.log('posted!!')
              })
          })
      })
  })
  .catch((error) => {
    console.error('ERROR: ' + error.message)
    console.error(error.stack)
    process.exit(1)
  })
