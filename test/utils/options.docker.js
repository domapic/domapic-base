
const path = require('path')

module.exports = {
  service: {
    protocol: 'http://',
    host: 'service',
    port: '3000'
  },
  paths: {
    domapicConfig: path.resolve(__dirname, '..', '..', 'config', '.domapic', 'service')
  },
  explicitServiceOptions: {
    path: '/app/config',
    hostName: 'service'
  }
}
