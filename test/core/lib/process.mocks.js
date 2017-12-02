const Promise = require('bluebird')

const test = require('../../test')

const core = require('../../../core')

const Stub = function () {
  let _constructor = test.sinon.stub(core, 'Process')

  let start = _constructor.prototype.start = test.sinon.spy((options) => {
    return Promise.resolve()
  })

  let stop = _constructor.prototype.stop = test.sinon.spy((options) => {
    return Promise.resolve()
  })

  let logs = _constructor.prototype.logs = test.sinon.spy((options) => {
    return Promise.resolve()
  })

  const restore = function () {
    core.Process.restore()
  }

  return {
    _constructor: _constructor,
    start: start,
    stop: stop,
    logs: logs,
    restore: restore
  }
}

module.exports = {
  Stub: Stub
}
