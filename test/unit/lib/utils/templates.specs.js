
const _ = require('lodash')

const test = require('mocha-sinon-chai')

const templates = require('../../../../lib/utils/templates')
const cliTemplates = require('../../../../lib/utils/templates/cli')

const PRE_COMPILED_TEMPLATES = ['cli', 'client', 'info', 'openapi', 'paths', 'process', 'server', 'service', 'storage']

test.describe('Utils -> templates', () => {
  test.describe('compile', () => {
    test.it('should return a template function for each received template', () => {
      const compiledTemplates = templates.compile(cliTemplates)
      _.each(cliTemplates, (stringTemplate, templateName) => {
        test.expect(compiledTemplates[templateName]).to.be.a('function')
      })
    })
  })

  test.describe('compiled', () => {
    test.it('should return an object containing all core precompiled templates', () => {
      _.each(PRE_COMPILED_TEMPLATES, (templatesScope) => {
        test.expect(templates.compiled[templatesScope]).to.be.an('object')
        if (templatesScope === 'cli') {
          _.each(templates.compiled[templatesScope], (template, templateName) => {
            test.expect(template).to.be.a('function')
          })
        }
      })
    })
  })

  test.describe('helpers', () => {
    const testHelperMethod = function (options) {
      test.describe(options.name, () => {
        test.it(options.description, () => {
          const fooTemplates = templates.compile({template: options.template})
          const templateResult = fooTemplates.template(options.templateData)
          test.expect(options.removeSpaces ? templateResult.replace(/\s/gmi, '') : templateResult).to.equal(options.expectedResult)
        })
      })
    }

    testHelperMethod({
      name: 'toJSON',
      description: 'should return the received object converted to JSON stringified string',
      template: '{{toJSON fooVar}}',
      templateData: {
        fooVar: {
          fooKey: 'fooValue'
        }
      },
      removeSpaces: true,
      expectedResult: '{"fooKey":"fooValue"}'
    })

    testHelperMethod({
      name: 'capitalize',
      description: 'should return the string capitalized',
      template: '{{capitalize fooVar}}',
      templateData: {
        fooVar: 'foo Phrase'
      },
      expectedResult: 'Foo phrase'
    })

    testHelperMethod({
      name: 'upperCase',
      description: 'should return the string converted to upperCase',
      template: '{{upperCase fooVar}}',
      templateData: {
        fooVar: 'foo Phrase'
      },
      expectedResult: 'FOO PHRASE'
    })

    test.describe('startCase', () => {
      test.it('should return the string converted to startCase', () => {
        const fooTemplates = templates.compile({template: '{{startCase fooVar}}'})

        test.expect(fooTemplates.template({
          fooVar: '--foo-bar--'
        })).to.equal('Foo Bar')

        test.expect(fooTemplates.template({
          fooVar: 'fooBar'
        })).to.equal('Foo Bar')

        test.expect(fooTemplates.template({
          fooVar: '__FOO_BAR__'
        })).to.equal('FOO BAR')
      })
    })

    test.describe('comma-separated', () => {
      test.it('provided an array, it should return it converted to a string separated by commas', () => {
        const fooTemplates = templates.compile({template: '{{comma-separated fooArray}}'})
        test.expect(fooTemplates.template({
          fooArray: ['a', 'b', 'c', 'd', 'e']
        })).to.equal('a,b,c,d,e')
      })
    })
  })
})
