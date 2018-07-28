'use strict'

const path = require('path')

const getNpmConfigArgv = function (npmConfigArgv) {
  try {
    npmConfigArgv = JSON.parse(npmConfigArgv)
  } catch (err) {
    return false
  }
  if (npmConfigArgv.original) {
    return npmConfigArgv.original
  }
  return false
}

const getUsedCommand = function () {
  const processEnv = process.env
  const npmConfigArgv = getNpmConfigArgv(processEnv['npm_config_argv'])
  let executionPath

  if (npmConfigArgv) {
    // Executed using npm command
    return `npm ${npmConfigArgv[0]} ${npmConfigArgv[1]}`
  } else if (processEnv['_']) {
    executionPath = processEnv['_']
    if (executionPath.indexOf(path.sep) === 0) {
      // Absolute path. Probably used global command
      return executionPath.split(path.sep).pop()
    } else {
      // Relative path, return the same execution path
      return executionPath
    }
  }
}

const toAbsolutePath = function (relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.resolve(process.cwd(), relativePath)
}

module.exports = {
  toAbsolutePath: toAbsolutePath,
  usedCommand: getUsedCommand
}
