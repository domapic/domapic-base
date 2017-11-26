const test = require('../../test')

const core = require('../../../core')
const enums = require('../../../lib/enums/log')
const start = require('../../../cli/commands/start')

test.describe('CLI start command', () => {
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
      start.command(fooOptions)
      test.expect(spyLog).to.have.been.calledWithNew()
    })

    test.it('should log the start message', () => {
      start.command(fooOptions)
      test.expect(spyInfo).to.have.been.calledWith(enums['starting-server-pm2'])
    })

    test.it('should log the options received', () => {
      start.command(fooOptions)
      test.expect(spyData).to.have.been.calledWith(fooOptions)
    })
  })
})
