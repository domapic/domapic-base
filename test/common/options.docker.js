
const path = require('path')

module.exports = {
  service: {
    protocol: 'http://',
    host: 'service-container',
    port: '3000'
  },
  paths: {
    domapicConfig: path.resolve(__dirname, '..', '..', '.shared', '.domapic', 'service')
  },
  explicitServiceOptions: {
    path: '/narval/.shared',
    hostName: 'service-container'
  }
}
