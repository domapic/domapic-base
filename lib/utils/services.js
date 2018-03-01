'use strict'

const _ = require('lodash')

const SERVICES_URL = 'services'
const COMMANDS_URL = 'commands'
const STATES_URL = 'states'
const EVENTS_URL = 'events'

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

const resolveUrl = function () {
  return Array.prototype.slice.call(arguments).join('/')
}

const commandUrl = function (name) {
  return resolveUrl(COMMANDS_URL, normalizeName(name))
}

const stateUrl = function (name) {
  return resolveUrl(STATES_URL, normalizeName(name))
}

const eventUrl = function (name) {
  return resolveUrl(EVENTS_URL, normalizeName(name))
}

const servicesUrl = function () {
  return SERVICES_URL
}

const serviceUrl = function (name) {
  return resolveUrl(servicesUrl(), normalizeName(name))
}

const serviceEventUrl = function (serviceName, eventName) {
  return resolveUrl(serviceUrl(serviceName), eventUrl(eventName))
}

module.exports = {
  serviceType: serviceType,
  normalizeName: normalizeName,
  commandUrl: commandUrl,
  eventUrl: eventUrl,
  stateUrl: stateUrl,
  servicesUrl: servicesUrl,
  serviceUrl: serviceUrl,
  serviceEventUrl: serviceEventUrl
}
