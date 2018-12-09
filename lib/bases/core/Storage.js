'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const templatesUtils = require('../../utils/templates')

const Storage = function (fileName, paths, errors, storagePath) {
  const templates = templatesUtils.compiled.storage
  let getDataPromise
  let data

  if (!fileName) {
    throw new errors.BadData(templates.noFileNameError())
  }

  const fullClone = function (data) {
    if (_.isObject(data)) {
      return JSON.parse(JSON.stringify(data))
    }
    return data
  }

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
          return !_.isUndefined(data[key]) ? Promise.resolve(fullClone(data[key])) : Promise.reject(new errors.BadData(templates.invalidKeyError({
            key: key
          })))
        }
        return Promise.resolve(fullClone(data))
      })
  }

  const set = function (key, value) {
    value = fullClone(value)
    key = fullClone(key)
    if (_.isUndefined(value)) {
      value = key
      key = null
    }
    if (key !== null && !_.isUndefined(key) && !_.isString(key)) {
      return Promise.reject(new errors.BadData(templates.invalidKeyFormatError({
        type: 'an string'
      })))
    }
    if (_.isUndefined(value)) {
      return Promise.reject(new errors.BadData(templates.noDataProvidedToSet()))
    }
    return getData()
      .then(() => {
        if (key) {
          data[key] = value
        } else {
          data = value
        }
        return saveData()
          .then(() => {
            return Promise.resolve(fullClone(key ? data[key] : data))
          })
      })
  }

  const remove = function (key) {
    if (!key) {
      return Promise.reject(new errors.BadData(templates.noKeyProvidedToRemove()))
    }
    return getData()
      .then(() => {
        delete data[key]
        return saveData()
          .then(() => {
            return Promise.resolve(fullClone(data))
          })
      })
  }

  const getPath = () => paths.resolve(storagePath)

  return {
    get,
    remove,
    set,
    getPath
  }
}

module.exports = Storage
