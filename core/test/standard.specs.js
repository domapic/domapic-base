const standard = require('mocha-standard')

const test = require('./index')

test.describe('Standard code style', function () {
  test.it('conforms to standard', standard.files(['*.js', '**/*.js']))
})
