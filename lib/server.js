'use strict'

const enums = require('./enums/log')
const core = require('../core')

const start = function (options) {
  const log = new core.Log()
  log.info(enums['starting-server'])
  log.data(options)
}

module.exports = {
  start: start
}
