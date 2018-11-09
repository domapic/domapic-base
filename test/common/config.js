
const path = require('path')

const PORT = '3000'

const serviceUrl = function () {
  return `http://${process.env.host_name}:${PORT}`
}

module.exports = {
  service: {
    host: process.env.host_name,
    port: PORT,
    url: serviceUrl
  },
  paths: {
    domapicConfig: path.resolve(__dirname, '..', '..', process.env.app_path, '.domapic', process.env.service_name)
  },
  explicitServiceOptions: {
    path: path.resolve(__dirname, '..', '..', process.env.app_path),
    hostName: process.env.host_name
  },
  serviceName: process.env.service_name
}
