# Domapic Microservices Base

[![Build status][circleci-image]][circleci-url]
[![Quality Gate][quality-gate-image]][quality-gate-url]
[![js-standard-style][standard-image]][standard-url]

[![Node version][node-version-image]][node-version-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]

[![NPM downloads][npm-downloads-image]][npm-downloads-url]
[![Website][website-image]][website-url]

---

## Introduction

This package is used as a base for __domapic-controller__, __domapic-service__ and __domapic-plugin__ packages.

Maybe you´ll better want to read documentation about that pieces and learn how use them directly, because this is an internal dependency. Anyway, if you think it can be useful for you separately...

It provides:

* __Server__ with an extensible API:
	* Optional ssl protocol, just provide ssl certificate and key paths.
	* Jwt and/or apiKey customizable authentication to api resources of choice.
	* Authentication can be disabled in a range of IPs of choice.
	* Customizable authorization level for each API resource.
	* Add API resources using OpenApi 3.0 definitions.
	* Http OPTIONS method created for each API resource, auto describing it.
	* Automatic api parameters and body validation using the openapi schemas.
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

---

## Table of Contents

* [Server](#server)
* [Options](#options)
* [Adding API resources](#add-api-resources)
* [Client](#client)
* [Traces](#traces)
* [Errors](#errors)
* [Storage](#storage)
* [Authentication](#authentication)
* [CLI](#command-line-interface)

---

## Server

```js
// server.js file
const path = require('path')
const domapic = require('domapic-microservice')

new domapic.Service({
	packagePath: path.resolve(__dirname)
}).then((service) => {
	return service.server.start()
})
```

The `packagePath` option must be the path where your package.json file is, in order to automatically create the `/api/about` api resource that can provide useful information about the package to other microservices.

```shell
# Start server
node ./server.js --name=fooName --port=8030
```

Browse to http://localhost:8030 to open Swagger interface and inspect API.

---

## Options

```shell
# Display help with detailed information about all options
node ./server.js --help
```

option | type | description | default
--- | --- | --- | ---
`name` | String | Service instance name | -
`port` | Number | Http port used | 8090
`hostName` | String | Hostname for the server | 0.0.0.0
`sslCert` | String | Path to an ssl certificate | -
`sslKey` | String | Path to an ssl key | - 
`authDisabled` | Array | Array of IPs or CIDR IP ranges with authentication disabled | ['127.0.0.1', '::1/128']
`color` | Boolean | Use ANSI colors in traces | true
`logLevel` | String | Tracing level. Choices are 'log', 'trace', 'debug', 'info', 'warn' and 'error' | info
`path` | String | Path to be used as home path, instead of user´s default (.domapic folder will be created inside) | ~
`saveConfig` | Boolean | Save current options for next execution (except `name` and `path`) | false

Setting options from command line example:
```shell
node ./server.js --name=fooName --authDisabled=192.168.1.1 172.0.0.1 --logLevel=debug --color=false
```

Get configuration:

```js
new domapic.Service({
	packagePath: path.resolve(__dirname)
}).then((service) => {
	return service.config.get()
}).then((configuration) => {
	console.log(configuration)
})
```

You can add your own custom configuration options. They will be seteable from command line execution, displayed in help and validated as the rest of options. Use `customConfig` parameter to define them.

[Yargs](https://www.npmjs.com/package/yargs) is used as underlayer to manage options, so you can read its documentation for more details about how to define them:

```js
// Usage of customConfig parameter
new domapic.Service({
	packagePath: path.resolve(__dirname),
	customConfig: {
		fooOption: {
			type: 'boolean',
			alias: ['foo-option'],
			describe: 'Testing a custom configuration option',
			default: true
		}
	}
}).then((service) => {
	return service.config.get()
}).then((configuration) => {
	console.log(configuration)
})
```
```shell
node ./server.js --name=fooName --fooOption=false
```

---

## Adding API resources

You can add your own API resources. They will be automatically added to the openapi.json definition, and will be available under the `/api` path of the server.

Openapi 3.0 spec is used to define new API paths. Read more about how to define paths in [Swagger specification docs](https://swagger.io/specification/). You can even use the [Swagger editor](https://swagger.io/specification/) to define and design yor API, and after it, load the .json files in domapic microservice.

You can add as many openApi definitions as you want, and for each one you can define "components", "tags", or "paths". The resultant `openapi.json` will be the result of extending all of them, after adding all needed base properties.


```js
// server.js file
const path = require('path')
const domapic = require('domapic-microservice')

const myOpenApi = require('./api/myOpenApi.json')

new domapic.Service({
	packagePath: path.resolve(__dirname),
}).then((service) => {
	return Promise.all([
		service.server.extendOpenApi(myOpenApi),
		service.server.addOperations({
			myApiOperation: {
				handler: (params, body, res) => {
					return Promise.resolve({
						hello: 'world'
					})
				}
			}
		})
	]).then((service) => {
		return service.server.start()
	})
})
```

See here an [openApi definition example](#lib/api/about/openapi.json), which is used internally to create the built-in `/about` api resource.

Each openApi path should contain a property called `operationId`. This value define which operation will be executed when the api resource is requested. Use the `addOperations` server method to add the operations. The operation key should match with the openApi `operationId` property.

Each operation can have properties:

* `handler` - The function that will be executed when the api resource is requested. Mandatory.
	* Arguments:
		* params - Request parameters. `params.path` and `params.query`.
		* body - Request body
		* res - Allows to set custom headers and statusCode to response. Examples: `res.status(201)`, 'res.header('location', '/api/books/new-book')'
	* Returns:
		* Can return a Promise. If rejected, the error will be mapped to a correspondant html error. If resolved, the resolved value will be returned as response body.
		* If returns a value, the value will be returned as response body.
		* If throws an error, the error will be mapped to a correspondant html error.
* `auth` - If authentication is enabled for the api resource, this method will be executed to check if the user have enough permissions. Can be a function, or a string that defines which authentication role function has to be executed. Read [Authentication](#authentication) for further info.
	* Arguments:
		* userData - The decoded data about the user that is making the request. Usually should contain user name, or even user role (Depending of the authentication method and implementation).
	* Returns: 
		* Promise.resolve, or `true` to validate the user.
		* Any other returned value will result in a Forbidden response.

---

## Client

Make requests to other Domapic Microservices-based packages. Automatic authentication and error handling is provided.

```js
new domapic.Service({
	packagePath: path.resolve(__dirname),
}).then((service) => {
	const client = new service.client.Connection('http://localhost:8090')
	return client.get('/about').then((response) => {
		console.log(response)
	})
})
```

```js
// Client with two authentication methods example
new domapic.Service({
	packagePath: path.resolve(__dirname),
}).then((service) => {
	const client = new service.client.Connection('http://localhost:8090',{
		apiKey: 'thisIsaFooApiKey',
		jwt: {
			userName: 'fooUserName',
			password: 'fooPassword'
		}
	})
	return client.get('/about').then((response) => {
		console.log(response)
	})
})
```

---

## Command Line Interface

---

[circleci-image]: https://circleci.com/bb/domapic/domapic-microservice/tree/master.svg?style=shield&circle-token=acc2b3d5b9cc7ef2dad5c89d487a4bca9ef6d754
[circleci-url]: https://circleci.com/bb/domapic/domapic-microservice
[license-image]: https://img.shields.io/npm/l/domapic-microservice.svg
[license-url]: https://github.com/javierbrea/domapic-microservice/blob/master/LICENSE
[node-version-image]: https://img.shields.io/node/v/domapic-microservice.svg
[node-version-url]: https://github.com/javierbrea/domapic-microservice/blob/master/package.json
[npm-image]: https://img.shields.io/npm/v/domapic-microservice.svg
[npm-url]: https://www.npmjs.com/package/domapic-microservice
[npm-downloads-image]: https://img.shields.io/npm/dm/domapic-microservice.svg
[npm-downloads-url]: https://www.npmjs.com/package/domapic-microservice
[quality-gate-image]: https://sonarcloud.io/api/badges/gate?key=domapic-microservice
[quality-gate-url]: https://sonarcloud.io/dashboard/index/domapic-microservice
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
[website-image]: https://img.shields.io/website-up-down-green-red/http/domapic.com.svg?label=domapic.com
[website-url]: http://domapic.com/




