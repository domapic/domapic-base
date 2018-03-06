
const puppeteer = require('puppeteer')
const test = require('../../unit/index')
const serviceUtils = require('../../utils/service')

test.describe('Swagger Web UI', function () {
  let page
  let browser

  test.before(function () {
    this.timeout(10000)
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
          return page.goto(serviceUtils.url())
        })
    })
  })

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
