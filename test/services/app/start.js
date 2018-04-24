
const path = require('path')
const domapic = require('../../../index.js')

console.log('ENVIRONMENT VARS IN NODE')
console.log('fooVar1 - ' + process.env.fooVar1)
console.log('fooVar2 - ' + process.env.fooVar2)
console.log('fooVar3 - ' + process.env.fooVar3)
console.log('narval_suite - ' + process.env.narval_suite)
console.log('narval_service - ' + process.env.narval_service)
console.log('narval_is_docker - ' + process.env.narval_is_docker)
console.log('---------------------------------')

new domapic.Service({
  packagePath: path.resolve(__dirname, '..', '..', '..')
}).then((service) => {
  return service.server.start()
}).catch(() => {
  process.exit(1)
})
