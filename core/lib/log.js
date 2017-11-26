'use strict'

const data = function (text) {
  console.log(text)
}

const info = function (text) {
  console.log(text)
}

const Log = function (options) {
  return {
    data: data,
    info: info
  }
}

module.exports = Log
