'use strict'

const Server = function (core) {
  const start = function () {
    core.config.get()
      .then((config) => {
        core.tracer.log(config)
        core.tracer.log('started')
      })
  }

  return {
    start: start
  }
}

module.exports = Server
