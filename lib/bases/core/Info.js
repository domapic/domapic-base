'use strict'

const fs = require('fs')
const path = require('path')

const fsExtra = require('fs-extra')

const utils = require('../../utils')

const Info = function (packagePath, errors) {
  const templates = utils.templates.compiled.info
  let packageJsonPath
  let packageJson

  const getName = function (packageJson) {
    if (!packageJson.name) {
      throw new errors.BadData(templates.noNameFound())
    }
    return packageJson.name
  }

  const getVersion = function (packageJson) {
    if (!packageJson.version) {
      throw new errors.BadData(templates.noVersionFound())
    }
    return packageJson.version
  }

  const getDescription = function (packageJson) {
    if (!packageJson.description) {
      throw new errors.BadData(templates.noDescriptionFound())
    }
    return packageJson.description
  }

  const getHomepage = function (packageJson) {
    return packageJson.homepage || ''
  }

  const getAuthor = function (packageJson) {
    return packageJson.author || {}
  }

  const getLicense = function (packageJson) {
    return packageJson.license || ''
  }

  if (!packagePath) {
    throw new errors.BadData(templates.noPackagePathDefined())
  }

  packageJsonPath = path.resolve(packagePath, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    throw new errors.BadData(templates.noPackageJsonFound())
  }

  packageJson = fsExtra.readJsonSync(packageJsonPath)

  return {
    name: getName(packageJson),
    type: utils.services.serviceType(packageJson.name),
    version: getVersion(packageJson),
    description: getDescription(packageJson),
    homepage: getHomepage(packageJson),
    author: getAuthor(packageJson),
    license: getLicense(packageJson)
  }
}

module.exports = Info
