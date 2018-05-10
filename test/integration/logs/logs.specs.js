
const path = require('path')
const fs = require('fs')

const test = require('narval')

test.describe('Service logs', function () {
  const logsPath = path.resolve(__dirname, '..', '..', '..', '.narval', 'logs', 'integration', 'logs', 'timeout')

  test.it('exit-code.log file should exist', () => {
    return test.expect(fs.existsSync(path.join(logsPath, 'exit-code.log'))).to.be.true()
  })
})
