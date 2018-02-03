# Domapic Microservices Base

[![Build status][circleci-image]][circleci-url]
[![js-standard-style][standard-image]][standard-url]
[![Quality Gate][quality-gate-image]][quality-gate-url]

[![Node version][node-version-image]][node-version-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]

[![NPM downloads][npm-downloads-image]][npm-downloads-url]
[![Website][website-image]][website-url]

## Introduction

This package is used as a base for domapic-controller, domapic-service and domapic-plugin packages.
Maybe you´ll better want to read documentation about that pieces and learn how use them directly, because this is an internal dependency. Anyway, if you think it can be useful for you separately...

It provides:

* __Server__ with an extensible API:
	* Optional ssl protocol, just provide ssl certificate and key paths.
	* Jwt and/or apiKey customizable authentication to api resources of choice.
	* Authentication can be disabled in a range of IPs of choice.
	* Customizable authorization level for each API resource.
	* Add API resources using OpenApi 3.0 definitions.
	* Http OPTIONS method created for each API resource, auto describing it.
	* API operations as Promises.
	* Automatic error handling mapped to HTTP errors.
	* Openapi.json auto generated and served.
	* Swagger web interface.
* __Client__ to other Domapic microservices:
	* Automatic authentication if API resource requires it.
	* Requests as Promises.
* __Configuration__
	* Built-in service command line options. (port, host, etc...).
	* Fully extensible with your own options.
	* Storable. Next executions will remember options if --saveConfig is specified in one execution.
* __Traces__
	* Six log levels.
	* Ansi colored, at your choice.
	* Daily file, last ten stored.
* __Errors__
	* Custom errors for easy error handling.
	* Mapping to HTTP errors.
* __Storage__
	* Javascript objects to JSON at file system and viceversa.
	* File system access scoped to service instance folder.

* __CLI__. Easy implementable in your own package, it provides:
	* Start the service using CLI, and the process will be delegated to PM2.
	* Multi-instanciable. Start many services instances providing different names.
	* CLI commands to stop or display logs.
	* Extensible with your own commands.

## Table of Contents
___

* [Usage](#usage)
* [Options](#options)
* [CLI](#command-line-interface)

## Usage
___

## Options
___

## Command Line Interface
___



[circleci-image]: https://circleci.com/bb/domapic/domapic.svg?style=shield&circle-token=3e836b50c79fdfe6bcaa2f4879037443e2916b44
[circleci-url]: https://circleci.com/bb/domapic/domapic
[license-image]: https://img.shields.io/npm/l/domapic.svg
[license-url]: https://github.com/javierbrea/domapic/blob/master/LICENSE
[node-version-image]: https://img.shields.io/node/v/domapic.svg
[node-version-url]: https://github.com/javierbrea/domapic/blob/master/package.json
[npm-image]: https://img.shields.io/npm/v/domapic.svg
[npm-url]: https://www.npmjs.com/package/domapic
[npm-downloads-image]: https://img.shields.io/npm/dm/domapic.svg
[npm-downloads-url]: https://www.npmjs.com/package/domapic
[quality-gate-image]: https://sonarcloud.io/api/badges/gate?key=domapic
[quality-gate-url]: https://sonarcloud.io/dashboard/index/domapic
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
[website-image]: https://img.shields.io/website-up-down-green-red/http/domapic.com.svg?label=domapic.com
[website-url]: http://domapic.com/




