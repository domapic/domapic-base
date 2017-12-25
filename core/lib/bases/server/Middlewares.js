'use strict'

const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const Promise = require('bluebird')

const Middlewares = function (core) {
  const notFound = function (req, res, next) {
    next(new core.errors.NotFound('Resource not found'))
  }

  const errorTrace = function (err, req, res, next) {
    core.tracer.debug(core.errors.toHTML(err).output.payload)
      .then(() => {
        next(err)
      })
  }

  const sendResponse = function (req, res, response, template) {
    if (req.accepts('html')) {
      res.type('html').render(template, response)
    } else if (req.accepts('json')) {
      res.type('json').send(response)
    } else {
      res.type('txt').send(response)
    }
  }

  const errorHandler = function (err, req, res, next) {
    const htmlError = core.errors.toHTML(err)
    res.status(htmlError.output.statusCode)
    sendResponse(req, res, htmlError.output.payload, 'templateName')
  }

  const serverLog = function (req, res, next) {
    core.tracer.group([
      {trace: req.method + ': ' + req.url + ' from ' + req.ip},
      {trace: 'body'},
      {trace: req.body},
      {trace: 'params'},
      {trace: req.params}
    ]).then(() => {
      next()
    })
  }

  const addPre = function (app) {
    app.use(methodOverride('_method'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(serverLog)
    return Promise.resolve()
  }

  const addPost = function (app) {
    app.use(notFound)
    app.use(errorTrace)
    app.use(errorHandler)
    return Promise.resolve()
  }

  const addMethodNotAllowed = function (route) {
    route.all((req, res, next) => {
      next(new core.errors.MethodNotAllowed())
    })
  }

  return {
    addPre: addPre,
    addPost: addPost,
    addMethodNotAllowed: addMethodNotAllowed,
    sendResponse: sendResponse
  }
}

module.exports = Middlewares
