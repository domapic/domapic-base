'use strict'

const core = require('./core')

const service = new core.Service()

service.server.start()
  .catch((error) => {
    service.tracer.error(error.message)
    process.exit(1)
  })
