'use strict'

const Log = function (options) {
  const data = function (text) {
    console.log(text)
  }

  const info = function (text) {
    console.log(text)
  }

  return {
    data: data,
    info: info
  }
}

module.exports = Log
