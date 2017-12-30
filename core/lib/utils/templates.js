'use strict'

const _ = require('lodash')

const hbs = require('hbs')

hbs.registerHelper('toJSON', function (object) {
  return new hbs.SafeString(JSON.stringify(object, null, 2))
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
