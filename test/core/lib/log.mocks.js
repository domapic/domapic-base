const Promise = require('bluebird')

const test = require('../../test')

const core = require('../../../core')

const Stub = function () {
  let _constructor = test.sinon.stub(core, 'Log')

  let info = _constructor.prototype.info = test.sinon.spy((options) => {
    return Promise.resolve()
  })

  let data = _constructor.prototype.data = test.sinon.spy((options) => {
    return Promise.resolve()
  })

  const restore = function () {
    core.Log.restore()
  }

  return {
    _constructor: _constructor,
    info: info,
    data: data,
    restore: restore
  }
}

module.exports = {
  Stub: Stub
}
