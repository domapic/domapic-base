
const _ = require('lodash')

const argumentsMocks = require('../Arguments.mocks')

const getResult = _.extend(
  argumentsMocks.getResult.defaults,
  argumentsMocks.getResult.explicit
)

module.exports = {
  getResult: getResult
}
