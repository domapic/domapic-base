
const Promise = require('bluebird')
const puppeteer = require('puppeteer')
const test = require('narval')
const config = require('../../common/config')

test.describe('Swagger Web UI', function () {
  this.timeout(10000)
  let page
  let browser

  const executeOperation = function (operationSelector) {
    const trySelector = operationSelector + ' div.try-out button'
    const executeSelector = operationSelector + ' div.execute-wrapper button'
    const responseSelector = operationSelector + ' div.responses-inner div div table.responses-table tbody tr.response'

    const codeResponseSelector = responseSelector + ' td.response-col_status'
    const bodyResponseSelector = responseSelector + ' td.response-col_description pre'

    return page.waitForSelector(operationSelector)
      .then(() => {
        return page.$(operationSelector).then((elementHandle) => {
          return elementHandle.click()
        })
      })
      .then(() => {
        return page.waitForSelector(trySelector)
      })
      .then(() => {
        return page.$(trySelector).then((elementHandle) => {
          return elementHandle.click()
        })
      })
      .then(() => {
        return page.waitForSelector(executeSelector)
      })
      .then(() => {
        return page.waitFor(500)
      })
      .then(() => {
        return page.$(executeSelector).then((elementHandle) => {
          return elementHandle.click()
        })
      })
      .then(() => {
        return Promise.all([
          page.waitForSelector(codeResponseSelector),
          page.waitForSelector(bodyResponseSelector)
        ])
      })
      .then(() => {
        return Promise.props({
          code: page.$eval(codeResponseSelector, element => element.textContent),
          body: page.$eval(bodyResponseSelector, element => {
            return JSON.parse(element.textContent.replace(/\n/g, ''))
          })
        })
      })
  }

  test.before(function () {
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
            return page.goto(config.service.url())
          })
      })
  })

  test.after(() => {
    return browser.close()
  })

  test.it('should print the package info when "get /about" api resource is executed', function () {
    const packageInfo = require('../../../package.json')
    return executeOperation('#operations-about-getAbout')
      .then((response) => {
        return Promise.all([
          test.expect(response.code).to.equal('200'),
          test.expect(response.body.name).to.equal('service'),
          test.expect(response.body.type).to.equal('module'),
          test.expect(response.body.package).to.equal(packageInfo.name),
          test.expect(response.body.version).to.equal(packageInfo.version),
          test.expect(response.body.description).to.equal(packageInfo.description),
          test.expect(response.body.author).to.equal(packageInfo.author.name),
          test.expect(response.body.license).to.equal(packageInfo.license),
          test.expect(response.body.homepage).to.equal(packageInfo.homepage)
        ])
      })
  })
})
