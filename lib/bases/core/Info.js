'use strict'

const fs = require('fs')
const path = require('path')

const fsExtra = require('fs-extra')

const templatesUtils = require('../../utils/templates')

const Info = function (packagePath, errors) {
  const templates = templatesUtils.compiled.info
  let packageJsonPath
  let packageJson

  const getName = function (packageJson) {
    if (!packageJson.name) {
      throw new errors.BadData(templates.noNameFound())
    }
    return packageJson.name
  }

  const getType = function (packageJson) {
    if (/-service$/.test(packageJson.name)) {
      return 'service'
    } else if (/-controller$/.test(packageJson.name)) {
      return 'controller'
    } else if (/-plugin$/.test(packageJson.name)) {
      return 'plugin'
    }

    throw new errors.BadData(templates.notValidName())
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

  const getHomePage = function (packageJson) {
    return packageJson.homePage || ''
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
    type: getType(packageJson),
    version: getVersion(packageJson),
    description: getDescription(packageJson),
    homePage: getHomePage(packageJson),
    author: getAuthor(packageJson),
    license: getLicense(packageJson)
  }
}

module.exports = Info
