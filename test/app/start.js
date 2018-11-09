
const path = require('path')
const domapic = require('../../index.js')

new domapic.Service({
  packagePath: path.resolve(__dirname, '..', '..'),
  type: 'module'
}).then((service) => {
  return service.server.start()
}).catch(() => {
  process.exit(1)
})
