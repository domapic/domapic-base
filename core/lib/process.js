'use strict'

const childProcess = require('child_process')
const path = require('path')

const _ = require('lodash')
const pm2 = require('pm2')
const Promise = require('bluebird')

const Process = function (options) {
  const defaultOptions = {
    minUptime: 2000,
    restartDelay: 1000,
    maxRestarts: 10,
    // TODO, add output and error to the same path, (process path from config)
    // TODO, colors
    logDateFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
  }
  let pm2Options = _.extend(defaultOptions, options)

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
          reject(error)
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

  const startPm2 = function () {
    return new Promise((resolve, reject) => {
      pm2.start(pm2Options, (error, pm2Process) => {
        if (error) {
          reject(error)
        } else {
          resolve(pm2Process)
        }
      })
    })
  }

  const stopPm2 = function () {
    return new Promise((resolve, reject) => {
      pm2.stop(pm2Options.name, (error, pm2Process) => {
        if (error) {
          reject(error)
        } else {
          resolve(pm2Process)
        }
      })
    })
  }

  const printPm2Logs = function () {
    return new Promise((resolve, reject) => {
      const log = childProcess.spawn(path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'pm2'), ['logs', options.name, '--raw'])
      log.stdout.on('data', (data) => {
        const cleaned = _.trim(data.toString())
        if (cleaned.length) {
          console.log(cleaned)
        }
      })
      log.stderr.on('data', (data) => {
        reject(new Error(data))
      })
      log.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Process exited with code ' + code))
        } else {
          resolve()
        }
      })
    })
  }

  const start = function () {
    return connect()
      .then(() => {
        return startPm2()
      })
      .then(() => {
        return disconnect()
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

  const logs = function () {
    return connect()
      .then(() => {
        return printPm2Logs()
      })
      .then(() => {
        return disconnect()
      })
  }

  if (!pm2Options.name) {
    throw new Error('No name was provided for process')
  }
  if (!pm2Options.script) {
    throw new Error('No script path was provided for process')
  }
  if (_.isObject(pm2Options.args)) {
    pm2Options.args = objectToArgs(pm2Options.args)
  }

  return {
    start: start,
    stop: stop,
    logs: logs
  }
}

module.exports = Process
