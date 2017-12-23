
const _ = require('lodash')

const test = require('../../index')

const templates = require('../../../lib/utils/templates')
const cliTemplates = require('../../../lib/templates/cli')

test.describe('Utils -> templates', () => {
  test.describe('compile', () => {
    test.it('should return a template function for each received template', () => {
      const compiledTemplates = templates.compile(cliTemplates)
      _.each(cliTemplates, (stringTemplate, templateName) => {
        test.expect(compiledTemplates[templateName]).to.be.a('function')
      })
    })
  })
})
