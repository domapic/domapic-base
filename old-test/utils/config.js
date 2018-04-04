
const isDocker = require('is-docker')
const localOptions = require('./options.local.js')
const dockerOptions = require('./options.docker.js')

const options = isDocker() ? dockerOptions : localOptions

const serviceUrl = function () {
  return options.service.protocol + options.service.host + ':' + options.service.port
}

module.exports = {
  service: {
    host: options.service.host,
    port: options.service.port,
    url: serviceUrl
  },
  paths: options.paths,
  explicitServiceOptions: options.explicitServiceOptions
}
