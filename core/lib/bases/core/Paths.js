'use strict'

const os = require('os')
const path = require('path')

const _ = require('lodash')

const Paths = function (options, errors) {
  if (!options.name) {
    throw new errors.BadData('No name provided, unable to resolve home path')
  }

  const homePath = path.resolve(os.homedir(), '.domapic', options.name)

  const getSubPath = function (subPath) {
    subPath = !_.isArray(subPath) ? [subPath] : subPath
    subPath.unshift(homePath)
    return path.resolve.apply(this, subPath)
  }

  const resolve = function (subPath) {
    return getSubPath(subPath)
  }

  // TODO, ensure dir, writeJSON, readJSON, etc...
  // TODO, move logs to log folder

  return {
    resolve: resolve
  }
}

module.exports = Paths
