'use strict'

const templates = require('./utils/templates')
const proc = require('./utils/process')
const misc = require('./utils/misc')

module.exports = {
  templates: templates,
  usedCommand: proc.usedCommand,
  serviceType: misc.serviceType
}
