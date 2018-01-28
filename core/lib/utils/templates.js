'use strict'

const _ = require('lodash')
const hbs = require('hbs')

const cli = require('./templates/cli')
const client = require('./templates/client')
const openapi = require('./templates/openapi')
const processTemplates = require('./templates/process')
const service = require('./templates/service')
const server = require('./templates/server')

hbs.registerHelper('toJSON', function (object) {
  return new hbs.SafeString(JSON.stringify(object, null, 2))
})

hbs.registerHelper('capitalize', function (str) {
  return _.capitalize(str)
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
    service: service,
    cli: cli,
    client: client,
    openapi: openapi,
    process: processTemplates,
    server: server
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
