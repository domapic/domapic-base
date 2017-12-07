'use strict'

const os = require('os')
const path = require('path')

const _ = require('lodash')
const Promise = require('bluebird')

const Paths = function (options, errors) {
  // TODO throw controlled error
  if (!options.name) {
    throw new Error('No name provided, unable to resolve home path')
  }

  const homePath = path.resolve(os.homedir(), '.domapic', options.name)

  const getSubPath = function (subPath) {
    subPath = !_.isArray(subPath) ? [subPath] : subPath
    subPath.unshift(homePath)
    return path.resolve.apply(this, subPath)
  }

  const resolve = function (subPath) {
    return Promise.resolve(getSubPath(subPath))
  }

  return {
    // TODO
    // readJson: readJson,
    // writeJson: writeJson,
    resolve: resolve
  }
}

module.exports = Paths
