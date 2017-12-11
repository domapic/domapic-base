'use strict'

const childProcess = require('child_process')
const path = require('path')

const _ = require('lodash')
const pm2 = require('pm2')
const Promise = require('bluebird')

const Process = function (options, paths, errors) {
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
    logDateFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
  }

  const getPm2Options = function () {
    if (!pm2OptionsPromise) {
      pm2OptionsPromise = paths.resolve(options.name + '.pm2.log')
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
            throw new errors.BadData('No name was provided for process')
          }
          if (!extendedOptions.script) {
            throw new errors.BadData('No script path was provided for process')
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
        argsArray.push('--' + key + '=' + value)
      }
    })
    return argsArray
  }

  const connect = function () {
    return new Promise((resolve, reject) => {
      pm2.connect((error) => {
        if (error) {
          reject(new errors.ChildProcess('PM2 connect: ' + error.message, error.stack))
        } else {
          resolve()
        }
      })
    })
  }

  const disconnect = function () {
    return new Promise((resolve) => {
      pm2.disconnect()
      resolve()
    })
  }

  const addArgumentsToOptions = function (args) {
    return getPm2Options()
      .then((pm2Options) => {
        args = _.isObject(args) ? objectToArgs(args) : args
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
              reject(new errors.ChildProcess('PM2 start: ' + error.message, error.stack))
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
              reject(new errors.ChildProcess('PM2 stop: ' + error.message, error.stack))
            } else {
              resolve(pm2Process)
            }
          })
        })
      })
  }

  const printPm2Logs = function (customOptions) {
    return new Promise((resolve, reject) => {
      const pm2Options = ['logs', options.name, '--raw']
      if (customOptions.lines) {
        pm2Options.push('--lines=' + customOptions.lines)
      }

      const log = childProcess.spawn(path.resolve(__dirname, '..', '..', '..', 'node_modules', '.bin', 'pm2'), pm2Options)
      log.stdout.on('data', (data) => {
        const cleaned = _.trim(data.toString())
        if (cleaned.length) {
          console.log(cleaned)
        }
      })
      log.stderr.on('data', (data) => {
        reject(new errors.ChildProcess(data))
      })
      log.on('close', (code) => {
        if (code !== 0) {
          reject(new errors.ChildProcess('Process exited with code ' + code))
        } else {
          resolve()
        }
      })
    })
  }

  const start = function (args) {
    return connect()
      .then(() => {
        return startPm2(args)
      })
      .then((pm2Process) => {
        return disconnect()
          .then(() => {
            return Promise.resolve(pm2Process)
          })
      })
  }

  const stop = function () {
    return connect()
      .then(() => {
        return stopPm2()
      })
      .then(() => {
        return disconnect()
      })
  }

  const logs = function (customOptions) {
    return connect()
      .then(() => {
        return printPm2Logs(customOptions)
      })
      .then(() => {
        return disconnect()
      })
  }

  return {
    start: start,
    stop: stop,
    logs: logs
  }
}

module.exports = Process
