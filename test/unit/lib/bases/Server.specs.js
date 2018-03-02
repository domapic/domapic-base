/*
const Promise = require('bluebird')

const test = require('../../index')
const mocks = require('../../mocks')

const Server = require('../../../../lib/bases/Server')

test.describe('Bases -> Server', () => {
  let server
  let stubCore

  test.beforeEach(() => {
    stubCore = new mocks.core.Stub()
    server = new Server(stubCore)
  })

  test.describe('start', () => {
    test.it('should return a Promise', (done) => {
      let response = server.start()
        .then(() => {
          test.expect(response).to.be.an.instanceof(Promise)
          done()
        })
    })

    test.it('should get config from core', (done) => {
      server.start()
        .then(() => {
          test.expect(stubCore.config.get).to.have.been.called()
          done()
        })
    })

    test.it('should trace the config with debug level', (done) => {
      server.start()
        .then(() => {
          test.expect(stubCore.tracer.debug).to.have.been.calledWith(mocks.config.getResult)
          done()
        })
    })
  })
}) */
