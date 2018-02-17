'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Operations = function (core, type) {
  return {
    getAbout: {
      handler: () => {
        return core.config.get()
          .then((configuration) => {
            let about = {
              name: configuration.name,
              type: core.info.type,
              package: core.info.name,
              version: core.info.version,
              description: core.info.description
            }
            if (core.info.author && core.info.author.name) {
              about.author = core.info.author.name
            } else if (_.isString(core.info.author)) {
              about.author = core.info.author
            }
            if (core.info.license) {
              about.license = core.info.license
            }
            if (core.info.homepage) {
              about.homepage = core.info.homepage
            }

            return Promise.resolve(about)
          })
      }
    }
  }
}

module.exports = Operations
