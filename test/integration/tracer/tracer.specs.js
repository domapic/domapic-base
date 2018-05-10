
const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')

const test = require('narval')
const config = require('../../common/config')

const getTodayDate = function () {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

const getTracesFilePath = function () {
  return path.resolve(config.paths.domapicConfig, 'logs', 'service.' + getTodayDate() + '.log')
}

test.describe('Tracer', function () {
  const traceFilePath = getTracesFilePath()

  test.describe('Daily file', function () {
    test.it('should save traces into a file containing the date', () => {
      return test.expect(fs.existsSync(traceFilePath)).to.be.true()
    })
  })

  test.describe('Traces', function () {
    let tracesFileContent = fs.readFileSync(traceFilePath, {
      encoding: 'utf8'
    })

    test.it('should log only traces with warn level', () => {
      return Promise.all([
        test.expect(tracesFileContent).not.to.include('[info]'),
        test.expect(tracesFileContent).to.include('[warn]')
      ])
    })
  })
})
