'use strict'

const core = require('./core')

new core.Service()
  .then((service) => {
    return service.server.start()
      .catch((error) => {
        return service.tracer.error(error)
          .then(() => {
            process.exit(1)
          })
      })
  })
  .catch((error) => {
    console.error('ERROR: ' + error.message)
    process.exit(1)
  })
