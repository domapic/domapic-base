
const path = require('path')

module.exports = {
  service: {
    protocol: 'http://',
    host: 'service',
    port: '3000'
  },
  paths: {
    domapicConfig: path.resolve(__dirname, '..', '..', '.shared', '.domapic', 'service')
  },
  explicitServiceOptions: {
    path: '/app/.shared',
    hostName: 'service'
  }
}
