'use strict'

const _ = require('lodash')

const stringTemplateCompile = require('string-template/compile')

const compile = function (templates) {
  let compiled = {}

  _.each(templates, (template, key) => {
    compiled[key] = stringTemplateCompile(template)
  })

  return compiled
}

module.exports = {
  compile: compile
}
