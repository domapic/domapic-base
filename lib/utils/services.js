'use strict'

const _ = require('lodash')

const serviceType = function (packageName) {
  if (/-service$/.test(packageName)) {
    return 'service'
  } else if (/-controller$/.test(packageName)) {
    return 'controller'
  } else if (/-plugin$/.test(packageName)) {
    return 'plugin'
  }
  return 'unrecognized'
}

const normalizeName = function (name) {
  return _.kebabCase(name)
}

module.exports = {
  serviceType,
  normalizeName
}
