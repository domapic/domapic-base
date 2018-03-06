
const isDocker = require('is-docker')

const host = function () {
  return isDocker() ? 'service' : 'localhost'
}

const port = function () {
  return '3000'
}

const url = function () {
  return 'http://' + host() + ':' + port()
}

module.exports = {
  host: host,
  port: port,
  url: url
}
