
const path = require('path')
const fs = require('fs')

const test = require('narval')

test.describe('Service logs', function () {
  const logsPath = path.resolve(__dirname, '..', '..', '..', '.narval', 'logs', 'integration', 'logs', 'timeout')

  test.it('output.log file should exist', () => {
    return test.expect(fs.existsSync(path.join(logsPath, 'output.log'))).to.be.true()
  })
})
