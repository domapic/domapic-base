'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Promise = require('bluebird')
const tracer = require('tracer')

const Tracer = function (options, paths, errors) {
  const methodNames = ['log', 'trace', 'debug', 'info', 'warn', 'error']

  const logger = tracer.console({
    level: options.logLevel,
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
          break
      }
      data.title = chalk.grey('[' + options.name + '] ') + subtitle
    },
    inspectOpt: {
      showHidden: false,
      depth: 4
    }
  })

  const fileLogger = tracer.dailyfile({
    level: options.logLevel,
    root: paths.resolve('.'),
    maxLogFiles: 10,
    allLogsFileName: options.name,
    format: [
      '[{{timestamp}}] [{{title}}] {{message}}',
      {
        error: '[{{timestamp}}] [{{title}}] {{message}}\nCall Stack:\n{{stack}}'
      }
    ],
    dateformat: 'yyyy/mm/dd - HH:MM:ss.L',
    inspectOpt: {
      showHidden: false,
      depth: 4
    }
  })

  const print = function (text, method) {
    return new Promise((resolve) => {
      logger[method](text)
      fileLogger[method](text)
      resolve()
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

  const methods = createMethods(methodNames)

  return methods
}

module.exports = Tracer
