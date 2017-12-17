
const options = {
  name: 'fooService',
  path: '/fooPath'
}

const getResult = {
  options: {
    color: false,
    name: 'testing',
    logLevel: 'info',
    path: undefined,
    port: undefined
  },
  defaults: {
    color: true,
    logLevel: 'info'
  },
  explicit: {
    name: 'testing'
  }
}

module.exports = {
  options: options,
  getResult: getResult
}
