const test = require('../../test')

const core = require('../../../core')

const options = {
  name: 'fooName',
  port: 34000
}

const Stub = function () {
  let _constructor = test.sinon.stub(core, 'Arguments')
  let getOptions = _constructor.prototype.getOptions = test.sinon.spy(() => {
    return options
  })
  let registerCommands = _constructor.prototype.registerCommands = test.sinon.spy()

  const restore = function () {
    core.Arguments.restore()
  }

  return {
    _constructor: _constructor,
    getOptions: getOptions,
    registerCommands: registerCommands,
    restore: restore
  }
}

module.exports = {
  Stub: Stub,
  options: options,
  wrongOptions: {
    y: 'testing',
    x: 2143
  }
}
