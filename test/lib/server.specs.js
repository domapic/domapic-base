const test = require('../test')

const core = require('../../core')
const enums = require('../../lib/enums/log')
const server = require('../../lib/server')

test.describe('Server', () => {
  const fooOptions = {
    name: 'fooName',
    port: 321
  }
  test.describe('start', () => {
    let spyLog,
      spyInfo,
      spyData

    test.beforeEach(() => {
      spyLog = test.sinon.stub(core, 'Log')
      spyInfo = spyLog.prototype.info = test.sinon.spy()
      spyData = spyLog.prototype.data = test.sinon.spy()
    })

    test.afterEach(() => {
      core.Log.restore()
    })

    test.it('should create a new Log instance from core', () => {
      server.start(fooOptions)
      test.expect(spyLog).to.have.been.calledWithNew()
    })

    test.it('should log the start message', () => {
      server.start(fooOptions)
      test.expect(spyInfo).to.have.been.calledWith(enums['starting-server'])
    })

    test.it('should log the options received', () => {
      server.start(fooOptions)
      test.expect(spyData).to.have.been.calledWith(fooOptions)
    })
  })
})
