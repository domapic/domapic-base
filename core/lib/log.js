'use strict'

const Promise = require('bluebird')

const Log = function (options) {
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

  return {
    data: data,
    info: info
  }
}

module.exports = Log
