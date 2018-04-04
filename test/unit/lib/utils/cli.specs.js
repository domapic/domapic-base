
const test = require('austral-whale')

const cli = require('../../../../lib/utils/cli')

test.describe('Utils -> cli', () => {
  test.describe('usedCommand', () => {
    let originalProcessEnv

    test.beforeEach(() => {
      originalProcessEnv = process.env
      process.env = JSON.parse(JSON.stringify(process.env))
    })

    test.afterEach(() => {
      process.env = originalProcessEnv
    })

    test.describe('when used an npm command to start the process', () => {
      test.it('it should return the used command', () => {
        test.expect(cli.usedCommand().indexOf('npm')).to.equal(0)
      })

      test.it('it should ignore npm arguments info if it is not a valid json', () => {
        process.env['npm_config_argv'] = '{worngJson}'
        process.env['_'] = '/fooRunCommand'
        test.expect(cli.usedCommand().indexOf('npm')).to.equal(-1)
      })

      test.it('it should ignore npm arguments info if it don´t contains info about the original used command', () => {
        process.env['npm_config_argv'] = '{"a":"b"}'
        process.env['_'] = './fooRunCommand'
        test.expect(cli.usedCommand().indexOf('npm')).to.equal(-1)
      })
    })

    test.describe('when used a global command to start the process', () => {
      test.it('it should return the used command', () => {
        const fooCommand = 'domapic'
        delete process.env['npm_config_argv']
        process.env['_'] = '/' + fooCommand
        test.expect(cli.usedCommand().indexOf(fooCommand)).to.equal(0)
      })
    })

    test.describe('when used a relative command to start the process', () => {
      test.it('it should return the used command', () => {
        const fooCommand = './bin/domapic'
        delete process.env['npm_config_argv']
        process.env['_'] = fooCommand
        test.expect(cli.usedCommand()).to.equal(fooCommand)
      })
    })

    test.describe('when it is not possible to detect the type of used command', () => {
      test.it('It should return undefined', () => {
        delete process.env['npm_config_argv']
        delete process.env['_']
        test.expect(cli.usedCommand()).to.equal(undefined)
      })
    })
  })
})
