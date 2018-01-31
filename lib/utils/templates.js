'use strict'

const _ = require('lodash')
const hbs = require('hbs')

const cli = require('./templates/cli')
const client = require('./templates/client')
const info = require('./templates/info')
const openapi = require('./templates/openapi')
const paths = require('./templates/paths')
const processTemplates = require('./templates/process')
const server = require('./templates/server')
const service = require('./templates/service')
const storage = require('./templates/storage')

hbs.registerHelper('toJSON', function (object) {
  return new hbs.SafeString(JSON.stringify(object, null, 2))
})

hbs.registerHelper('capitalize', function (str) {
  return _.capitalize(str)
})

hbs.registerHelper('upperCase', function (str) {
  return str.toUpperCase()
})

hbs.registerHelper('startCase', function (str) {
  return _.startCase(str)
})

hbs.registerHelper('comma-separated', function (arr) {
  return arr.join(',')
})

const compile = function (templates) {
  let compiled = {}

  _.each(templates, (template, key) => {
    compiled[key] = hbs.handlebars.compile(template)
  })

  return compiled
}

const preCompile = function () {
  const toPreCompile = {
    cli: cli,
    client: client,
    info: info,
    openapi: openapi,
    paths: paths,
    process: processTemplates,
    server: server,
    service: service,
    storage: storage
  }
  let compiled = {}

  _.each(toPreCompile, (templates, templatesScope) => {
    compiled[templatesScope] = compile(templates)
  })

  return compiled
}

module.exports = {
  compile: compile,
  compiled: preCompile()
}
