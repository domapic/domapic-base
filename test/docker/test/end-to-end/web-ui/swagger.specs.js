
const puppeteer = require('puppeteer')
const test = require('../test/unit/index')

test.describe('Swagger Web UI', function () {
  let page
  let browser

  test.before(() => {
    return puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })
    .then((br) => {
      browser = br
      return browser.newPage()
        .then((pg) => {
          page = pg
          return page.goto('http://service:3000')
        })
    })
  }).timeout(5000)

  test.after(() => {
    return browser.close()
  })

  test.it('should load the swagger interface', () => {
    return page.content()
      .then((content) => {
        console.log(content)
      })
  })
})
