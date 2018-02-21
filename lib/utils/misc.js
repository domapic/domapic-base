'use strict'

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

module.exports = {
  serviceType: serviceType
}
