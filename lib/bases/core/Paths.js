'use strict'

const os = require('os')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')

const _ = require('lodash')
const Promise = require('bluebird')

const templatesUtils = require('../../utils/templates')

const Paths = function (options, errors) {
  const templates = templatesUtils.compiled.paths
  let homePath
  if (!options || !options.name) {
    throw new errors.BadData(templates.noNameProvidedError())
  }

  const getAbsolute = function (relative) {
    if (path.isAbsolute(relative)) {
      return relative
    }
    return path.resolve(process.cwd(), relative)
  }

  const getPath = function () {
    if (options.path) {
      return getAbsolute(options.path)
    }
    return os.homedir()
  }

  const getHomePath = function () {
    if (!homePath) {
      homePath = path.resolve(getPath(), '.domapic', options.name)
    }
    return homePath
  }

  const getSubPath = function (subPath) {
    subPath = !_.isArray(subPath) ? [subPath] : subPath
    subPath.unshift(getHomePath())
    return path.resolve.apply(this, subPath)
  }

  const resolve = function (subPath) {
    return Promise.resolve(getSubPath(subPath))
  }

  const ensureDir = function (dir) {
    return resolve(dir)
      .then((absoluteDir) => {
        return fsExtra.ensureDir(absoluteDir)
          .then(() => {
            return Promise.resolve(absoluteDir)
          })
      })
  }

  const ensureFile = function (file) {
    return resolve(file)
      .then((absoluteFile) => {
        return fsExtra.ensureFile(absoluteFile)
          .then(() => {
            return Promise.resolve(absoluteFile)
          })
      })
  }

  const writeJSON = function (file, json) {
    return ensureFile(file)
      .then((filePath) => {
        return fsExtra.writeJSON(filePath, json, {
          spaces: 2
        })
          .then(() => {
            return Promise.resolve(filePath)
          })
      })
  }

  const readJSON = function (file) {
    return resolve(file)
      .then(fsExtra.readJSON)
      .catch(() => {
        return Promise.reject(new errors.BadData(templates.readJsonError({
          path: file
        })))
      })
  }

  const ensureJSON = function (file) {
    return resolve(file)
      .then((filePath) => {
        return new Promise((resolve, reject) => {
          if (fs.existsSync(filePath)) {
            resolve(filePath)
          } else {
            writeJSON(filePath, {})
              .then(() => {
                resolve(filePath)
              })
              .catch((error) => {
                reject(error)
              })
          }
        })
      })
  }

  return {
    ensureDir,
    ensureFile,
    readJSON,
    writeJSON,
    ensureJSON,
    resolve
  }
}

module.exports = Paths
