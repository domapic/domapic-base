'use strict'

const path = require('path')

const _ = require('lodash')
const addRequestId = require('express-request-id')
const bodyParser = require('body-parser')

const Middlewares = function (core) {
  const templates = core.utils.templates.compiled.server

  const EnableCors = function () {
    return function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    }
  }

  const notFound = function (req, res, next) {
    next(new core.errors.NotFound(templates.resourceNotFoundError()))
  }

  const logRequest = function (req, res, next) {
    const logRequest = [templates.receivedRequestTitleLog({req: req}), templates.receivedRequestLog({req: req}), templates.requestIdLog({req: req})]
    const logHeaders = [templates.requestHeadersTitleLog(), templates.requestIdLog({req: req}), '\n', req.headers]
    let logParameters = [templates.requestInfoTitleLog(), templates.requestIdLog({req: req})]
    let log

    if (!_.isEmpty(req.params)) {
      logParameters.push(templates.requestParamsLog({req: req}))
    }
    if (!_.isEmpty(req.body)) {
      logParameters.push(templates.requestBodyLog({req: req}))
    }
    if (!_.isEmpty(req.query)) {
      logParameters.push(templates.requestQueryLog({req: req}))
    }
    if (!req.lowerRequestLogLevel) {
      log = [{debug: logRequest}, {trace: logParameters}, {log: logHeaders}]
    } else {
      log = [{trace: logRequest}, {log: logHeaders}]
    }

    core.tracer.group(log).then(() => {
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
    let sendType = req.sendOnly ? req.sendOnly : (req.accepts('html') && template ? 'html' : (req.accepts('json') ? 'json' : 'text'))

    if (_.isUndefined(response)) {
      res.send()
    } else if (sendType === 'html') {
      res.type(sendType).render(template, response)
    } else {
      res.type(sendType).send(response)
    }
    logResponse(req, res, response, template)
  }

  const errorHandler = function (err, req, res, next) {
    const htmlError = core.errors.toHTML(err)
    res.status(htmlError.output.statusCode)
    sendResponse(req, res, htmlError.output.payload, path.resolve(__dirname, 'views', 'error.hbs'))
  }

  const methodNotAllowed = function (req, res, next) {
    next(new core.errors.MethodNotAllowed(templates.methodNotAllowedError({
      method: req.method
    })))
  }

  const sendOnlyJson = function (req, res, next) {
    req.sendOnly = 'json'
    next()
  }

  const lowerRequestLogLevel = function (req, res, next) {
    req.lowerRequestLogLevel = true
    next()
  }

  const OperationId = function (operationId) {
    return function (req, res, next) {
      req.operationId = operationId
      next()
    }
  }

  const DomapicHeaders = function (options) {
    return function (req, res, next) {
      res.set('X-Domapic-Service-Type', options.serviceType)
      res.set('X-Domapic-Service-Name', options.name)
      next()
    }
  }

  return {
    EnableCors: EnableCors,
    DomapicHeaders: DomapicHeaders,
    methodNotAllowed: methodNotAllowed,
    addRequestId: addRequestId(),
    errorHandler: errorHandler,
    errorTrace: errorTrace,
    jsonBodyParser: bodyParser.json(),
    logRequest: logRequest,
    lowerRequestLogLevel: lowerRequestLogLevel,
    notFound: notFound,
    OperationId: OperationId,
    sendResponse: sendResponse,
    sendOnlyJson: sendOnlyJson,
    urlEncoded: bodyParser.urlencoded({ extended: true })
  }
}

module.exports = Middlewares
