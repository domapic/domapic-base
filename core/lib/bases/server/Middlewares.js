'use strict'

const path = require('path')

const _ = require('lodash')
const addRequestId = require('express-request-id')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const methodOverride = require('method-override')
const Promise = require('bluebird')
const tableify = require('tableify')

const serverTemplates = require('../../templates/server')

const Middlewares = function (core) {
  const templates = core.utils.templates.compile(serverTemplates)
  const notFound = function (req, res, next) {
    next(new core.errors.NotFound(templates.resourceNotFoundError()))
  }

  const logRequest = function (req, res, next) {
    // TODO, do not trace assets
    const debug = [templates.receivedRequestTitleLog({req: req}), templates.receivedRequestLog({req: req}), templates.requestIdLog({req: req})]
    const log = [templates.requestHeadersTitleLog(), templates.requestIdLog({req: req}), '\n', req.headers]
    let trace = [templates.requestInfoTitleLog(), templates.requestIdLog({req: req})]
    if (!_.isEmpty(req.params)) {
      trace.push(templates.requestParamsLog({req: req}))
    }
    if (!_.isEmpty(req.body)) {
      trace.push(templates.requestBodyLog({req: req}))
    }
    if (!_.isEmpty(req.query)) {
      trace.push(templates.requestQueryLog({req: req}))
    }
    core.tracer.group([{debug: debug}, {trace: trace}, {log: log}]).then(() => {
      next()
    })
  }

  const logResponse = function (req, res, response, template) {
    const responseType = res.getHeaders()['content-type'] || 'no content'
    const info = [templates.sendResponseTitleLog(), templates.sendResponseLog({res: res}), templates.requestIdLog({req: req})]
    const log = [templates.responseHeadersTitleLog(), templates.requestIdLog({req: req}), '\n', res.getHeaders()]
    let trace = [templates.responseContentTitleLog({type: responseType}), templates.requestIdLog({req: req})]
    if (!_.isUndefined(response)) {
      trace.push(templates.responseContentLog({response: response}))
    }
    if (!_.isUndefined(template) && responseType.indexOf('html') > -1) {
      trace.push(templates.responseTemplateLog({template: template}))
    }
    core.tracer.group([{info: info}, {trace: trace}, {log: log}])
  }

  const errorTrace = function (err, req, res, next) {
    let traces = []
    const isControlled = core.errors.isControlled(err)
    if (!isControlled) {
      traces.push({
        error: [templates.processRequestError(), templates.requestIdLog({req: req}), '\n', err]
      })
    } else {
      traces.push({
        warn: [templates.processRequestControlledError({message: err.message}), templates.requestIdLog({req: req})]
      }, {
        trace: [templates.errorStackLog({message: err.message}), templates.requestIdLog({req: req}), '\n', err.stack]
      })
    }
    core.tracer.group(traces)
      .then(() => {
        next(err)
      })
  }

  const sendResponse = function (req, res, response, template) {
    if (_.isUndefined(response)) {
      res.send()
    } else {
      if (req.accepts('html') && template) {
        res.type('html').render(template, _.extend({}, response, {body: new hbs.SafeString(tableify(response))}))
      } else if (req.accepts('json')) {
        res.type('json').send(response)
      } else {
        res.type('txt').send(response)
      }
    }
    logResponse(req, res, response, template)
  }

  const errorHandler = function (err, req, res, next) {
    const htmlError = core.errors.toHTML(err)
    res.status(htmlError.output.statusCode)
    sendResponse(req, res, htmlError.output.payload, path.resolve(__dirname, '..', '..', 'views', 'error.html'))
  }

  const addPre = function (app) {
    app.use(addRequestId())
    app.use(methodOverride('_method'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(logRequest)
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
      next(new core.errors.MethodNotAllowed(templates.methodNotAllowedError({
        method: req.method
      })))
    })
    return Promise.resolve(route)
  }

  return {
    addPre: addPre,
    addPost: addPost,
    addMethodNotAllowed: addMethodNotAllowed,
    sendResponse: sendResponse
  }
}

module.exports = Middlewares
