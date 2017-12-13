'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Storage = function (fileName, paths, errors, tracer) {
  let getDataPromise
  let data

  const loadFile = function () {
    return paths.ensureJSON(fileName)
        .then(paths.readJSON)
  }

  const saveData = function () {
    return paths.writeJSON(fileName, data)
  }

  const getData = function () {
    if (!getDataPromise) {
      getDataPromise = loadFile()
        .then((fileData) => {
          data = fileData
          return Promise.resolve(data)
        })
    }
    return getDataPromise
  }

  const get = function (key) {
    return getData()
      .then(() => {
        if (key) {
          return !_.isUndefined(data[key]) ? Promise.resolve(_.clone(data[key])) : Promise.reject(new errors.BadData('Invalid storage key: ' + key))
        }
        return Promise.resolve(_.clone(data))
      })
  }

  const set = function (key, value) {
    return getData()
      .then(() => {
        data[key] = value
        saveData()
        return Promise.resolve(_.clone(data[key]))
      })
  }

  const remove = function (key) {
    return getData()
      .then(() => {
        delete data[key]
        saveData()
        return Promise.resolve()
      })
  }

  return {
    get: get,
    remove: remove,
    set: set
  }
}

module.exports = Storage
