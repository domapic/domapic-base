'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Operations = function (core, type) {
  return {
    getConfig: {
      handler: (params, body, res, userData) => {
        console.log('USER DATA!!!')
        console.log(userData)
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
