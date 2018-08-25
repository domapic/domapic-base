'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Operations = function (core, type) {
  return {
    getConfig: {
      handler: () => {
        return core.config.get()
          .then((configuration) => {
            let config = _.clone(configuration)
            delete config.name
            delete config.saveConfig
            return Promise.resolve(config)
          })
      }
    }
  }
}

module.exports = Operations
