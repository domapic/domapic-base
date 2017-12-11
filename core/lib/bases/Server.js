'use strict'

const Server = function (core) {
  const start = function () {
    return core.config.get()
      .then((config) => {
        return core.tracer.debug(config)
          .then(() => {
            return core.tracer.info('started')
          })
      })
  }

  return {
    start: start
  }
}

module.exports = Server
