const standard = require('mocha-standard')

const test = require('./test')

test.describe('Standard code style', function () {
  test.it('conforms to standard', standard.files(['*.js', '**/*.js']))
})
