const test = require('../../test')

const core = require('../../../core')

const Stub = function () {
  let _constructor = test.sinon.stub(core, 'Log')
  let info = _constructor.prototype.info = test.sinon.spy()
  let data = _constructor.prototype.data = test.sinon.spy()

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
