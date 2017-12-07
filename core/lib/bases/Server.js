'use strict'

const Server = function (core) {
  const start = function () {
    return core.config.get()
      .then((config) => {
        core.tracer.debug(config)
        core.tracer.info('started')
      })
  }

  return {
    start: start
  }
}

module.exports = Server
