'use strict'

const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')

const _ = require('lodash')
const pm2 = require('pm2')
const Promise = require('bluebird')

const FIND_LIMIT = 5

const findDependencyFile = function (filePath) {
  let i = 0
  let absoluteFilePath = null

  filePath.unshift('node_modules')

  while (!absoluteFilePath && i < FIND_LIMIT) {
    i += 1
    let tryPath = path.resolve.apply(this, [__dirname].concat(Array(1 + i).fill('..')).concat(filePath))
    if (fs.existsSync(tryPath)) {
      absoluteFilePath = tryPath
    }
  }

  if (!absoluteFilePath) {
    throw new Error('"' + filePath.join(path.sep) + '" not found in dependencies')
  }
  return absoluteFilePath
}

const Process = function (options, core) {
  const templates = core.utils.templates.compiled.process
  let pm2OptionsPromise

  const defaultOptions = {
    cwd: process.cwd(),
    minUptime: 2000,
    restartDelay: 1000,
    maxRestarts: 10,
    mergeLogs: true,
    env: {
      DEBUG_COLORS: true
    },
    logDateFormat: templates.logDateFormat()
  }

  const getPm2Options = function () {
    if (!pm2OptionsPromise) {
      pm2OptionsPromise = core.paths.ensureFile('logs/' + options.name + '.pm2.log')
        .then((homePath) => {
          const extendedOptions = _.extend(
            {},
            defaultOptions,
            {
              output: homePath,
              error: homePath
            },
            options
          )
          if (!extendedOptions.name) {
            throw new core.errors.BadData(templates.noNameError())
          }
          if (!extendedOptions.script) {
            throw new core.errors.BadData(templates.noScriptPathError())
          }
          return Promise.resolve(extendedOptions)
        })
    }
    return pm2OptionsPromise
  }

  const objectToArgs = function (argsObject) {
    let argsArray = []
    _.each(argsObject, (value, key) => {
      if (value !== undefined) {
        let values = _.isArray(value) ? value : [value]
        if (_.isEmpty(values)) {
          argsArray.push('--' + key)
        } else {
          _.each(values, (val) => {
            argsArray.push('--' + key + '=' + val)
          })
        }
      }
    })
    return argsArray
  }

  const connect = function () {
    return new Promise((resolve, reject) => {
      pm2.connect((error) => {
        if (error) {
          reject(new core.errors.ChildProcess(templates.pm2Error({method: 'connect', message: error.message}), error.stack))
        } else {
          resolve()
        }
      })
    })
  }

  const disconnect = function () {
    pm2.disconnect()
  }

  const addArgumentsToOptions = function (args) {
    return getPm2Options()
      .then((pm2Options) => {
        args = _.isString(args) ? [args] : (_.isArray(args) ? args : objectToArgs(args))
        return Promise.resolve(_.extend({}, pm2Options, {
          args: args
        }))
      })
  }

  const startPm2 = function (pm2Args) {
    return addArgumentsToOptions(pm2Args)
      .then((pm2Options) => {
        return new Promise((resolve, reject) => {
          pm2.start(pm2Options, (error, pm2Process) => {
            if (error) {
              reject(new core.errors.ChildProcess(templates.pm2Error({method: 'start', message: error.message}), error.stack))
            } else {
              resolve(pm2Process)
            }
          })
        })
      })
  }

  const stopPm2 = function () {
    return getPm2Options()
      .then((pm2Options) => {
        return new Promise((resolve, reject) => {
          pm2.stop(pm2Options.name, (error, pm2Process) => {
            if (error) {
              reject(new core.errors.ChildProcess(templates.pm2Error({method: 'stop', message: error.message}), error.stack))
            } else {
              resolve(pm2Process)
            }
          })
        })
      })
  }

  const printPm2Logs = function (customOptions) {
    customOptions = customOptions || {}
    return new Promise((resolve, reject) => {
      const pm2Options = ['logs', options.name, '--raw']
      if (customOptions.lines) {
        pm2Options.push('--lines=' + customOptions.lines)
      }

      const log = childProcess.spawn(findDependencyFile(['pm2', 'bin', 'pm2']), pm2Options)

      log.on('close', (code) => {
        if (code !== 0) {
          reject(new core.errors.ChildProcess(templates.pm2CloseError({code: code})))
        } else {
          resolve()
        }
      })

      log.stdout.on('data', (data) => {
        const cleaned = _.trim(data.toString())
        if (cleaned.length) {
          console.log(cleaned)
        }
      })

      log.stderr.on('data', (data) => {
        reject(new core.errors.ChildProcess(data))
      })
    })
  }

  const start = function (args) {
    return connect()
      .then(() => {
        return startPm2(args)
      })
      .finally(() => {
        disconnect()
      })
  }

  const stop = function () {
    return connect()
      .then(stopPm2)
      .finally(() => {
        disconnect()
      })
  }

  const logs = function (customOptions) {
    return connect()
      .then(getPm2Options)
      .then(() => {
        return printPm2Logs(customOptions)
      })
      .finally(() => {
        disconnect()
      })
  }

  return {
    start: start,
    stop: stop,
    logs: logs
  }
}

module.exports = Process
