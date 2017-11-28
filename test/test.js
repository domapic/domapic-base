/* global describe, it, before, beforeEach, after, afterEach */

const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const dirtyChai = require('dirty-chai')

chai.use(sinonChai)
// chai.use(chaiAsPromised)
chai.use(dirtyChai)

module.exports = {
  before: before,
  beforeEach: beforeEach,
  after: after,
  afterEach: afterEach,
  describe: describe,
  it: it,
  expect: chai.expect,
  sinon: sinon
}
