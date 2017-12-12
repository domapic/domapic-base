'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Promise = require('bluebird')
const tracer = require('tracer')

Promise.config({ // TODO, remove this, only enabled during development
  warnings: true,
  longStackTraces: true
})

const Tracer = function (config, paths, errors) {
  const methodNames = ['log', 'trace', 'debug', 'info', 'warn', 'error']
  let initTracerPromise

  const initTracers = function () {
    let inspectOpt = {}

    if (!initTracerPromise) {
      initTracerPromise = Promise.props({
        logsPath: paths.ensureDir('logs'),
        config: config.get()
      }).then((results) => {
        let logger

        if (methodNames.indexOf(results.config.logLevel) < 2) {
          inspectOpt = {
            showHidden: true,
            depth: 10
          }
        }

        logger = tracer.console({
          level: results.config.logLevel,
          format: [
            '{{message}}',
            {
              log: '{{title}}' + chalk.grey('{{message}}'),
              trace: '{{title}}' + chalk.grey('{{message}}'),
              debug: '{{title}}' + chalk.white('{{message}}'),
              info: '{{title}}' + chalk.whiteBright('{{message}}'),
              warn: '{{title}}' + chalk.yellow('{{message}}'),
              error: '{{title}}' +
                chalk.red('{{message}}') +
                chalk.white('\nAt: ') +
                chalk.grey('{{timestamp}}') +
                chalk.white('\nCall Stack:\n') +
                chalk.grey('{{stack}}')
            }
          ],
          dateformat: 'yyyy/mm/dd - HH:MM:ss.L',
          preprocess: (data) => {
            let subtitle = ''
            switch (data.title) {
              case 'log':
                subtitle = chalk.grey('[log] ')
                break
              case 'trace':
                subtitle = chalk.white('[trace] ')
                break
              case 'debug':
                subtitle = chalk.cyan('[debug] ')
                break
              case 'info':
                subtitle = chalk.green('[info] ')
                break
              case 'warn':
                subtitle = chalk.yellowBright.bold('[WARN] ')
                break
              case 'error':
                subtitle = chalk.redBright.bold('[ERROR] ')
                if (data.args[0] instanceof Error) {
                  data.stack = data.args[0].stack
                  data.args[0] = data.args[0].toString()
                }
                break
            }
            data.title = chalk.grey('[' + results.config.name + '] ') + subtitle
          },
          inspectOpt: inspectOpt
        })

        // TODO, make this deactivable
        const file = tracer.dailyfile({
          level: results.config.logLevel,
          root: results.logsPath,
          maxLogFiles: 10,
          allLogsFileName: results.config.name,
          format: [
            '[{{timestamp}}] [{{title}}] {{message}}',
            {
              error: '[{{timestamp}}] [{{title}}] {{message}}\nCall Stack:\n{{stack}}'
            }
          ],
          dateformat: 'yyyy/mm/dd - HH:MM:ss.L',
          inspectOpt: inspectOpt
        })

        return Promise.resolve({
          logger: logger,
          file: file
        })
      })
    }
    return initTracerPromise
  }

  const print = function (text, method) {
    return initTracers()
      .then((tracers) => {
        tracers.logger[method](text)
        tracers.file[method](text)
        return Promise.resolve()
      })
  }

  const LogMethod = function (methodName) {
    return function (text) {
      return print(text, methodName)
    }
  }

  const createMethods = function (methodNames) {
    let methods = {}
    _.each(methodNames, (methodName) => {
      methods[methodName] = new LogMethod(methodName)
    })

    return methods
  }

  return createMethods(methodNames)
}

module.exports = Tracer
