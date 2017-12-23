
const test = require('../../index')

const pm2Process = {
  name: 'fooProcessName'
}

const pm2Error = 'foo PM2 Error'
const pm2ConnectError = 'foo PM2 Connect Error'

const processSpawn = function () {
  let functionToExecute
  let returns
  let resolver
  let resolverReturn

  const callsFake = function (actionToExecute, data) {
    functionToExecute = actionToExecute
    if (actionToExecute === 'on') {
      resolverReturn = data
    } else {
      returns = data
    }
  }

  const stdout = test.sinon.spy((eventName, func) => {
    if (functionToExecute === 'stdout') {
      func(returns)
      resolver(resolverReturn)
    }
  })

  const stderr = test.sinon.spy((eventName, func) => {
    if (functionToExecute === 'stderr') {
      func(returns)
    }
  })

  const on = test.sinon.spy((eventName, func) => {
    if (functionToExecute === 'on') {
      func(resolverReturn)
    } else {
      resolver = func
    }
  })

  return {
    stdout: {
      on: stdout
    },
    stderr: {
      on: stderr
    },
    on: on,
    callsFake: callsFake
  }
}

module.exports = {
  pm2Process: pm2Process,
  pm2ConnectError: pm2ConnectError,
  pm2Error: pm2Error,
  processSpawn: processSpawn
}
