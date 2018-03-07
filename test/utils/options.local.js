
const path = require('path')

module.exports = {
  service: {
    protocol: 'http://',
    host: 'localhost',
    port: '3000'
  },
  paths: {
    domapicConfig: path.resolve(__dirname, '..', '..', '.test', '.domapic', 'service')
  },
  explicitServiceOptions: {
    path: '../../../.test'
  }
}
