const test = require('../../test')

const core = require('../../../core')

const Stub = function () {
  let spyLog = test.sinon.stub(core, 'Log')
  let spyInfo = spyLog.prototype.info = test.sinon.spy()
  let spyData = spyLog.prototype.data = test.sinon.spy()

  const restore = function () {
    core.Log.restore()
  }

  return {
    _constructor: spyLog,
    info: spyInfo,
    data: spyData,
    restore: restore
  }
}

module.exports = {
  Stub: Stub
}
