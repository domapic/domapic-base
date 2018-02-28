'use strict'

const path = require('path')

const toAbsolutePath = function (relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.resolve(process.cwd(), relativePath)
}

module.exports = {
  port: {
    type: 'number',
    alias: ['p'],
    describe: 'Port number for the server',
    default: 3000
  },
  authDisabled: {
    type: 'array',
    alias: ['authenticationDisabled', 'authSubnet', 'authenticatedSubnet'],
    describe: 'Array of IPs or CIDR IP ranges with authentication disabled',
    default: ['127.0.0.1', '::1/128']
  },
  sslCert: {
    type: 'string',
    alias: ['sslCrt'],
    describe: 'SSL certificate',
    normalize: true,
    coerce: toAbsolutePath
  },
  sslKey: {
    type: 'string',
    describe: 'SSL key',
    normalize: true,
    coerce: toAbsolutePath
  },
  hostName: {
    type: 'string',
    alias: ['host'],
    describe: 'Host name for the server',
    default: '0.0.0.0'
  }
}
