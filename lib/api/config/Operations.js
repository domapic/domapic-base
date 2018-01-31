'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Operations = function (core, type) {
  return {
    getConfig: {
      auth: 'operator',
      handler: () => {
        return core.config.get()
          .then((configuration) => {
            let config = _.clone(configuration)
            delete config.name
            return Promise.resolve(config)
          })
      }
    }
  }
}

module.exports = Operations
