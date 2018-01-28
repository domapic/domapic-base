'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Promise = require('bluebird')
const tracer = require('tracer')

const Tracer = function (config, paths, errors) {
  const methodNames = ['log', 'trace', 'debug', 'info', 'warn', 'error']
  let initTracerPromise

  const ensureArray = function (param) {
    return _.isArray(param) ? param : [param]
  }

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
                '{{timestamp}}' +
                chalk.grey('{{stack}}')
            }
          ],
          dateformat: 'yyyy/mm/dd - HH:MM:ss.L',
          preprocess: (data) => {
            let subtitle = ''
            let showErrorStack
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
                _.each(data.args, (arg, index) => {
                  if (arg instanceof Error) {
                    showErrorStack = true
                    data.timestamp = chalk.white('\nAt: ') + chalk.grey(data.timestamp) + chalk.white('\nCall Stack: ')
                    data.stack = arg.stack
                    data.args[index] = arg.toString()
                  }
                })
                if (!showErrorStack) {
                  data.timestamp = ''
                  data.stack = ''
                }
                break
            }
            if (data.args.length > 1 && !_.isObject(data.args[0])) {
              data.args[0] = chalk.bold(data.args[0])
            }
            data.title = chalk.grey('[' + results.config.name + '] ') + subtitle
          },
          inspectOpt: inspectOpt
        })

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

  const print = function (texts, method) {
    return initTracers()
      .then((tracers) => {
        tracers.logger[method].apply(this, texts)
        tracers.file[method].apply(this, texts)
        return Promise.resolve()
      })
  }

  const LogMethod = function (methodName) {
    return function () {
      return print(arguments, methodName)
    }
  }

  const Group = function (methods) {
    return function (logs) {
      return Promise.mapSeries(logs, (logData) => {
        const methodName = _.keys(logData)[0]
        const toLog = logData[methodName]
        return methods[methodName].apply(this, ensureArray(toLog))
      })
    }
  }

  const createMethods = function (methodNames) {
    let methods = {}
    _.each(methodNames, (methodName) => {
      methods[methodName] = new LogMethod(methodName)
    })

    methods.group = new Group(methods)

    return methods
  }

  return createMethods(methodNames)
}

module.exports = Tracer
