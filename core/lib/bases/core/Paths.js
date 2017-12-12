'use strict'

const os = require('os')
const path = require('path')
const fsExtra = require('fs-extra')

const _ = require('lodash')
const Promise = require('bluebird')

const Paths = function (options, errors) {
  if (!options.name) {
    throw new errors.BadData('No name provided, unable to resolve server home path')
  }

  // TODO, home path completely customizable
  const homePath = path.resolve(os.homedir(), '.domapic', options.name)

  const getSubPath = function (subPath) {
    subPath = !_.isArray(subPath) ? [subPath] : subPath
    subPath.unshift(homePath)
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
        return fsExtra.writeJSON(filePath, json)
      })
  }

  const readJSON = function (file) {
    return resolve(file)
      .then(fsExtra.readJSON)
  }

  return {
    ensureDir: ensureDir,
    ensureFile: ensureFile,
    readJSON: readJSON,
    writeJSON: writeJSON
  }
}

module.exports = Paths
