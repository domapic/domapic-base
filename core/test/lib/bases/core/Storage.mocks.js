
const data = {
  fooString: 'fooString',
  fooObject: {
    fooKey1: 'fooValue1',
    fooKey2: 'fooValue2'
  },
  fooStringsArray: ['fooString1', 'fooString2'],
  fooObjectsArray: [{
    fooObject1: 'fooObject1Value'
  },
  {
    fooObject2: 'fooObject2Value'
  }]
}

const options = {
  fileName: 'fooFileName'
}

module.exports = {
  data: data,
  options: options
}
