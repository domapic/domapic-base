# Domapic Microservice Base

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
	* Six different log levels.
	* Ansi colored, at your choice.
	* Daily file, last ten stored.
* __Errors__
	* Custom errors for easy error handling.
	* Mapping to HTTP errors.
* __Storage__
	* Javascript objects to JSON at file system and viceversa.
	* File system access scoped to service instance folder.
* __CLI__. Easy implementable in your own package, it provides:
	* If the service is started using the CLI, the process will be executed in background, and managed using PM2.
	* Multi-instanciable. Start many services instances providing different names.
	* CLI commands to stop or display logs.
	* Extensible with your own commands.
* __Unit Testing__ stubs and mocks.
	* A set of mocks ans stubs is exposed in order to make easier to develop unit tests in packages that are using this one.

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
* [Unit testing](#unit-testing)

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

The `packagePath` parameter must be the path where your package.json file is, in order to automatically create the `/api/about` api resource that can provide useful information about the package to other microservices.

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

### Get options

```js
new domapic.Service({
	packagePath: path.resolve(__dirname)
}).then((service) => {
	return service.config.get()
}).then((configuration) => {
	console.log(configuration)
})
```

### Custom options

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

Default options values (or saved values if the `--saveConfig` option is used) is saved to a file at `~/.domapic/<serviceName>/config/service.json`. This file can be edited manually, and the new values will be applied next time the service is started.

---

## Adding API resources

You can add your own API resources. They will be automatically added to the openapi.json definition, and will be available under the `/api` path of the server.

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

### Open API definitions

Openapi 3.0 spec is used to define new API paths. Read more about how to define paths in [Swagger specification docs](https://swagger.io/specification/). You can even use the [Swagger editor](https://swagger.io/specification/) to define and design your API, and afterwards, load the resultant .json files in domapic microservice.

You can add as many openApi definitions as you want, and for each one you can define "components", "tags", or "paths". The resultant `openapi.json` will be the result of extending all of them, after adding all needed base properties.

Use the `addOperations` server method to add the operations. The operation key should match with the openApi `operationId` property.

See here an [openApi definition example](#lib/api/about/openapi.json), which is used internally to create the built-in `/about` api resource.

### Operations

Each openApi path should contain a property called `operationId`. This value define which operation will be executed when the api resource is requested.

Use the `addOperations` server method to add the operations. The operation key should match with the openApi `operationId` property.

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
* `auth` - If authentication is enabled for the api resource, this method will be executed to check if the user have enough permissions. Can be a function, or a string that defines which authorization role function has to be executed. Read [Authentication](#authentication) for further info.
	* Arguments:
		* userData - The decoded data about the user that is making the request. Usually should contain user name, or even user role (Depending of the authentication method and implementation).
	* Returns: 
		* Promise.resolve, or `true` to validate the user.
		* Any other returned value will result in a Forbidden response.

```js
service.server.addOperations({
	myApiOperation: {
		auth: (userData) => {
			if (userIsAllowed(userData)) {
				return Promise.resolve()
			}
			return Promise.reject()
		},
		handler: (params, body, res) => {
			res.status(201)
			res.header('location', '/api/books/new-book')
			return Promise.resolve({
				hello: 'world'
			})
		}
	}
})
```

---

## Client

Make requests to other Domapic Microservices-based services. Automatic authentication and error handling is provided.

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

## Traces

There are six different levels of traces. Depending of the choiced log level when started the service, the trace will be printed to the console and written to the daily file or not.

All traces in a day are saved to a file, into `~/.domapic/<serviceName>/logs/<serviceName>.<date>.log`. Trace files older than ten days are automatically deleted.

When the service is started at background using the built-in CLI, logs are also saved to a file at `~/.domapic/<serviceName>/logs/<serviceName>.pm2.log`. It is recommended to install [PM2 log rotation](https://github.com/keymetrics/pm2-logrotate) to avoid this file growing too much.

Sorted tracer levels are: 'log', 'trace', 'debug', 'info', 'warn' and 'error'.

Tracer usage:

```js
new domapic.Service({
	packagePath: path.resolve(__dirname),
}).then((service) => {
	return service.tracer.debug('testing').then(() => {
		return service.tracer.log('testing log')
	}).then(() => {
		return service.tracer.warn('This is a warning', 'This is part of the same warning')
	}).then(() => {
		return service.tracer.error(new Error('This will print the error stack'))
	}).then(() => {
		return service.tracer.error('Printed with error style, but no stack')
	})
})
```

There is an extra method called `group`, that allows to invoque different levels of tracers at a time:

```js
new domapic.Service({
	packagePath: path.resolve(__dirname),
}).then((service) => {
	return service.tracer.group([
		{
			log: 'This is a log'
		},
		{
			trace: 'This is a trace'
		},
		{
			warn: 'This is a warn'
		}
	])
})
```

---

## Errors

Custom errors contructors are provided through the `service.errors` object.

Custom errors usage:

```js
new domapic.Service({
	packagePath: path.resolve(__dirname),
}).then((service) => {
	return Promise.reject(new service.errors.BadData('Received bad data'))
}).catch(service.errors.BadData, () => {
	console.log('Bad data error caught')
	throw new service.errors.BadImplementation()
})
```

Consult [all available error constructors](lib/bases/core/Errors.js) and its correspondences with html errors.

In addition to error constructors, three methods are provided in the `errors` object. This methods are used internally by domapic-microservice in order to map the returned errors to HTML errors and viceversa:

* `isControlled` - Allows to know if error has been created with a custom error constructor

```js
let error = new service.errors.Conflict()
console.log(service.errors.isControlled(error))
// true

error = new Error()
console.log(service.errors.isControlled(error))
// false
```

* `FromCode` - Returns an error created with the constructor correspondant to the provided html error status code:

```js
return Promise.reject(new service.errors.FromCode(403, 'Custom message'))
	.catch(service.errors.Forbidden, (err) => {
		console.log('Forbidden error caught')
		console.log(err.message)
		// Custom message
	})
```

* `toHTML` - Returns a [Boomified](https://www.npmjs.com/package/boom) error correspondant to the used error constructor. Each error constructor is mapped to an specific status code, ready to be returned by the API:

```js
const error = new service.errors.Forbidden()
console.log( service.errors.toHTML(error).payload.statusCode )
// 403
```

---

## Storage

Storage methods read and save json data from a file stored as `~/.domapic/<serviceName>/storage/service.json`.

```js
service.storage.set('fooProperty', {test: 'testing'}))
	.then(() => {
		return service.storage.get('fooProperty')
	})
	.then((data) => {
		console.log(data)
		// {test: 'testing'}
		return service.storage.remove('fooProperty')
	})
```

Methods

* `get` - Get data from file
	* Arguments:
		* key - Optional, key of the object to get. If no provided, entire data is returned.
	* Returns: 
		* A promise, resolved with the correspondant data.
* `set` - Save data into the storage object.
	* Arguments:
		* key - Optional. Key of the object to set. If no provided, entire data is overwritten by the given value.
		* value - Data to be saved.
* `remove` - Removes a property from the stored object.
	* Arguments:
		* key - Key of the object to remove.

---

## Authentication

The server supports two types of authentication with built-in api "login" urls and token validations.

Each authentication strategy need some different methods to be provided in order to be activated. This externally provided methods have the responsibility of checking the user data, and then delegate the rest of the flow into the built-in security modules. In the case of Json Web Token, as the rest of the process is "token-based", this methods will be only invoqued at "login" or "refresh token" points.

Use the server `addAuthentication` method to define your authentication implementations. The parameter must be an object containing keys `jwt` and/or `apiKey`, which will contain the specific configuration for each method:

### Api key

Must contain properties:

* verify - Checks if the received api key is still allowed to be used.
	* Arguments:
		* apiKey - Received api key in the request header.
	* Returns:
		* Promise.resolve(userData) -> Allowed, pass the user data to authorization methods.
		* Rejected promise -> Unauthorized.
* authenticate - API operation for requesting a new api key. This api point needs authentication as well, so, if your system  authentication is only api key based, you have to define an initial api key that could be used to request more in case it´s needed.
	* auth - Authorization method for the `/api/auth/apikey` POST api resource.
	* handler - Operation handler for the `/api/auth/apikey` POST api resource.
		* Should return a new api key.
* revoke - API operation for removing an api key. This api resource needs authentication as well.
	* auth - Authorization method for the `/api/auth/apikey` DELETE api resource.
	* handler - Operation handler for the `/api/auth/apikey` DELETE api resource.
		* Any returned value will be ignored, and not exposed to the api response.

```js
service.server.addAuthentication({
	apiKey: {
		verify: (apiKey) => {
			// Check if apiKey is allowed, and return correspondant user data, or reject.
			return getUserDataFromApiKey(apiKey)
		},
		authenticate: {
			auth: (userData) => {
				// Check if user is allowed to create a new api key, resolve or reject
				return checkUserPermissionToManageApiKeys(userData)
			},
			handler: () => {
				// Returns a new api key
				return getNewApiKey()
			}
		},
		revoke: {
			auth: (userData) => {
				// Check if user is allowed to remove an existant api key, resolve or reject
				return checkUserPermissionToManageApiKeys(userData)
			},
			handler: () => {
				// Remove existant api key
				return removeApiKey()
			}
		}
	}
})
```

### JWT


### Authorization

About authorization, each operation defined in the API can have its own `auth` method, that will receive the decoded user data as argument for each request, allowing to reject or allow an specific request based on your own security policy implementation.

The authorization method is agnostic in relation with the used authentication method, because it only receives the user data, no matter the method used to store or recover this data from the request.

An operation `auth` method can be defined as a function, or as a string that defines which "authorization role" function has to be executed. This "authorization roles" must to be defined in the server:

```js
service.server.addAuthorization('fooRoleName', (userData) => {
	if (roleIsAllowed(userData.role)) {
		return Promise.resolve()
		// Execute the operation handler
	}
	return Promise.reject()
	// Forbidden response
}).then(() => {
	return service.addOperations({
		fooOperation: {
			auth: 'fooRoleName',
			handler: () => {
				return {}
			}
		}
	})
})
```

Read more about how to define and use the `auth` methods in the [operations chapter](#operations).

---

## Command Line Interface

---

## Unit testing

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




