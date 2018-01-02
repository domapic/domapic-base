'use strict'

const _ = require('lodash')

const hbs = require('hbs')

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

module.exports = {
  compile: compile
}
