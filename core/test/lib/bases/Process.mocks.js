
const test = require('../../index')

const pm2Process = {
  name: 'fooProcessName'
}

const pm2Error = 'foo PM2 Error'
const pm2ConnectError = 'foo PM2 Connect Error'

const processSpawn = function () {
  let functionToExecute
  let returns

  const callsFake = function (actionToExecute, data) {
    functionToExecute = actionToExecute
    returns = data
  }

  const stdout = test.sinon.spy((eventName, func) => {
    if (functionToExecute === 'stdout') {
      test.sinon.stub(console, 'log')
      func(returns)
      console.log.restore()
    }
  })

  const stderr = test.sinon.spy((eventName, func) => {
    if (functionToExecute === 'stderr') {
      func(returns)
    }
  })

  const on = test.sinon.spy((eventName, func) => {
    if (functionToExecute === 'on') {
      func(returns)
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
