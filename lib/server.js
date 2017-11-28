'use strict'

const enums = require('./enums/log')
const core = require('../core')

const start = function (options) {
  const log = new core.Log()
  return log.info(enums['starting-server'])
    .then(() => {
      return log.data(options)
    })
}

module.exports = {
  start: start
}
