
const Promise = require('bluebird')

const Operations = function (core, type) {
  return {
    getInfo: {
      handler: () => {
        return core.config.get()
          .then((configuration) => {
            return Promise.resolve({
              name: configuration.name,
              type: core.info.type,
              package: core.info.name,
              version: core.info.version
            })
          })
      }
    }
  }
}

module.exports = Operations
