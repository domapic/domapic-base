
const path = require('path')

module.exports = {
  service: {
    protocol: 'http://',
    host: 'localhost',
    port: '3000'
  },
  paths: {
    domapicConfig: path.resolve(__dirname, '..', '..', '.tmp', '.domapic', 'service')
  },
  explicitServiceOptions: {
    path: path.resolve(__dirname, '..', '..', '.tmp')
  }
}
