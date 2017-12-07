'use strict'

const Promise = require('bluebird')

const Tracer = function (options, paths, errors) {
  const print = function (text) {
    return new Promise((resolve) => {
      console.log(text)
      resolve()
    })
  }

  const data = function (text) {
    return print(text)
  }

  const info = function (text) {
    return print(text)
  }

  const log = function (text) {
    return print(text)
  }

  const error = function (text) {
    return print('ERROR: ' + text)
  }

  return {
    data: data,
    info: info,
    log: log,
    error: error
  }
}

module.exports = Tracer
