![Domapic Base][domapic-base-logo-image]

# Domapic Base

Base for Domapic Node.js packages.

[![Build status][travisci-image]][travisci-url] <!-- [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] --> [![js-standard-style][standard-image]][standard-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] <!-- [![Last release][release-image]][release-url] -->

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![Website][website-image]][website-url] [![License][license-image]][license-url]

---

## Table of Contents

* [Introduction](#introduction)
* [Quick Start](#quick-start)
* [Options](#options)
	* [Get config](#get-config)
	* [Set config](#set-config)
	* [Custom config](#custom-config)
* [Server](#server)
* [Adding API resources](#adding-api-resources)
	* [Open API definitions](#open-api-definitions)
	* [Operations](#operations)
  * [Custom middlewares](#custom-middlewares)
* [Client](#client)
* [Traces](#traces)
* [Errors](#errors)
* [Storage](#storage)
* [Utils](#utils)
* [Info](#info)
* [Authentication](#authentication)
	* [Api Key](#api-key)
	* [Jwt](#jwt)
	* [Authorization](#authorization)
* [CLI](#command-line-interface)
	* [Implementation](#implementation)
	* [Usage](#usage)
	* [Custom options and commands](#custom-options-and-commands)
* [Test suites](#test-suites)

---

## Introduction

This package is used as a base for [__domapic-controller__][domapic-controller-url] and [__domapic-service__][domapic-service-url] packages.

Maybe you´ll better want to read documentation about that pieces and learn how use them directly, because this is an internal dependency. Anyway, if you think it can be useful for you separately...

It provides:

* __Server__ with an extensible API:
	* Optional ssl protocol, just provide ssl certificate and key paths.
	* OAUTH. Jwt and/or apiKey customizable authentication to api resources of choice.
	* Authentication can be disabled in a range of IPs of choice, or completely.
	* Customizable authorization level for each API resource.
	* Add API resources using OpenApi 3.0 definitions.
	* Http OPTIONS method created for each API resource, auto describing it.
	* Automatic api parameters and body validation using the openapi schemas.
	* API operations as Promises.
	* Automatic error handling mapped to HTTP errors.
	* Openapi.json auto generated and served.
	* Built-in _Swagger_ web interface.
  * Allows serving statics under paths of your choice.
* __Client__ to other Domapic services:
	* Automatic authentication if API resource requires it.
	* Requests as Promises.
* __Configuration__
	* Built-in service command line options. (port, host, etc...).
	* Fully extensible with your own options.
	* Storable. Next executions will remember options if `--saveConfig` is specified in one execution.
* __Traces__
	* Six different log levels.
	* Ansi colored, at your choice.
	* Daily file, last ten stored.
* __Errors__
	* Custom errors for easy error handling.
	* Mapping to HTTP errors.
* __Storage__
	* Javascript objects to JSON at file system and viceversa.
	* File system access scoped to unique service instance folder.
* __CLI__. Easy implementable in your own package, it provides:
	* If the service is started using the CLI, the process will be executed in background, and managed using [_PM2_][pm2-url].
	* Multi-instanciable. Start many services instances providing different names.
	* CLI commands to stop or display logs.
	* Extensible with your own commands.

---

## Quick start

```js
// server.js file
const path = require('path')
const domapic = require('domapic-base')

domapic.Service({
  packagePath: path.resolve(__dirname),
  type: 'module'
}).then(service => {
  return service.server.start()
})
```

* The `packagePath` option must be the path where your package.json file is, in order to automatically create the `/api/about` api resource that can provide useful information about the package to other domapic services.
* The `type` option will be exposed in the `api/about` api resource directly, in order to inform about the service type.

```shell
# Start server
node ./server.js
```

Browse to http://localhost:3000 to open _Swagger_ interface and inspect API.

[back to top](#table-of-contents)

---

## Options

```shell
# Display help with detailed information about all options
node ./server.js --help
```

option | type | description | default
--- | --- | --- | ---
`name` | String | Service instance name. If not received, the service name will be the package name | -
`port` | Number | Http port used | 3000
`hostName` | String | Hostname for the server | -
`sslCert` | String | Path to an ssl certificate | -
`sslKey` | String | Path to an ssl key | - 
`authDisabled` | Array | Array of IPs or CIDR IP ranges with authentication disabled | ['127.0.0.1', '::1/128']
`auth` | Boolean | If false, the authentication will be disabled for all api resources and origins | true
`color` | Boolean | Use ANSI colors in traces | true
`logLevel` | String | Tracing level. Choices are 'log', 'trace', 'debug', 'info', 'warn' and 'error' | info
`path` | String | Path to be used as home path, instead of user´s default (.domapic folder will be created inside) | ~
`saveConfig` | Boolean | Save current options for next execution (except `name` and `path`) | false
`rejectUntrusted` | Boolean | Reject untrusted ssl certificates when using built-in client to make requests to another services | false

Example of setting options from command line:
```shell
node ./server.js --name=fooName --authDisabled=192.168.1.1 172.0.0.1 --logLevel=debug --color=false --auth=true
```

### Get config

Options defined from command line are available in the `config` object of the service.

`service.config.get([key])`

```js
domapic.Service({
  packagePath: path.resolve(__dirname)
}).then(service => {
  return service.config.get()
}).then(configuration => {
  console.log(configuration)
})
```

### Set config

It is not recommended, but, it if has sense, `config` properties can be modified programmatically. If you want to store some data, you´ll better want to read about the [storage feature](#storage). 

`service.config.set(key [, value])`

```js
domapic.Service({
  packagePath: path.resolve(__dirname)
}).then(service => {
  return service.config.set('fooKey', 'fooValue')
    .then(value => {
      console.log(value)
      // fooValue
    })
})
```

### Custom config

You can add your own custom configuration options. They will be seteable from command line execution, displayed in help and validated as the rest of options. Use `customConfig` parameter to define them.

[_Yargs_][yargs-url] is used as underlayer to manage options, so you can read its documentation for more details about how to define them:

```js
// Usage of customConfig parameter
domapic.Service({
  packagePath: path.resolve(__dirname),
  customConfig: {
    fooOption: {
      type: 'boolean',
      alias: ['foo-option'],
      describe: 'Testing a custom configuration option',
      default: true
    }
  }
}).then(service => {
  return service.config.get()
}).then(configuration => {
  console.log(configuration)
})
```
```shell
node ./server.js --fooOption=false
```

Custom options defined for a service should be defined in CLI implementation too, to make them available from command line interface. Read the [CLI custom options and commands](#custom-options-and-commands) chapter for further info.

Default options values (or saved values if the `--saveConfig` option is used) are saved into a file at `~/.domapic/<serviceName>/config/service.json`. This file can be edited manually, and the new values will be applied next time the service is started.

[back to top](#table-of-contents)

---

## Server

The `service.server` object has methods:

* `start` - Starts the server. Returns a promise, resolved when the server is running. Once the server is started, it is not possible to add more open api definitions, operations, or authentication implementations.
* `init` - Only initialize the server, adding all internal middlewares and routers, and returns the server instance. This allows you to add more custom middlewares, sockets, etc. This method should be called just before calling to the "start" method.
* `extendOpenApi` - Add open api definitions to the server. Read the [Adding API resources](#adding-api-resources) chapter for further info.
* `addOperations` - Add operations related to api paths. Read [Adding API resources](#adding-api-resources)).
* `addAuthentication` - Add authentication implementations. Read [Authentication](#authentication).
* `addAuthorization` - Add authorization roles. Read [Authentication](#authentication).
* `addMiddleware` - Add custom middlewares to api. Read [Custom middlewares](#custom-middlewares).
* `addStatic` - Serve statics. First argument defines server path, second argument defines fileSystem path. `addStatic("/assets", path.resolve(__dirname, "assets"))`. Statics added with this method will be served using gzip compression.

[back to top](#table-of-contents)

---

## Adding API resources

You can add your own API resources. They will be automatically added to the openapi.json definition, and will be available under the `/api` path of the server.

```js
// server.js file
const path = require('path')
const domapic = require('domapic-base')

const myOpenApi = require('./api/myOpenApi.json')

domapic.Service({
  packagePath: path.resolve(__dirname)
}).then(service => {
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
  ]).then(() => {
    return service.server.start()
  })
})
```

### Open API definitions

`service.server.extendOpenApi(openApiDefinition)`

Openapi 3.0 spec is used to define new API paths. Read more about how to define paths in [_Swagger_ specification docs](https://swagger.io/specification/). You can even use the [_Swagger_ editor](https://swagger.io/swagger-editor/) to define and design your API, and afterwards, load the resultant .json files in _domapic base_.

You can add as many openApi definitions as you want, and for each one you can define "components", "tags", or "paths". The resultant `openapi.json` will be the result of extending all of them, after adding all needed base properties.

See here an [openApi definition example](lib/api/about/openapi.json), which is used internally to create the built-in `/about` api resource.

### Operations

`service.server.addOperations(apiOperationsObject)`

Each openApi path should contain a property called `operationId`. This value defines which operation will be executed when the api resource is requested.

Use the `addOperations` server method to add the operations. The operation key should match with the openApi `operationId` property.

Each operation can have properties:

* `handler` - The function that will be executed when the api resource is requested. Mandatory.
	* Arguments:
		* params - Request parameters. `params.path` and `params.query`.
		* body - Request body
		* res - Allows to set custom headers and statusCode to response. Examples: `res.status(201)`, `res.header('location', '/api/books/new-book')`
		* userData - If user is "logged in", The userData returned by the correspondant authentication method `verify` handler will be received in this property.
	* Returns:
		* Can return a Promise. If rejected, the error will be mapped to a correspondant html error. If resolved, the resolved value will be returned as response body.
		* If returns a value, the value will be returned as response body.
		* If throws an error, the error will be mapped to a correspondant html error.
* `parse` - Parse parameters from request.
	* It must be an object, with first level keys as request object where the parameter will be found, and second level keys as parameter name to be parsed. The `parser` function will receive the original value of the parameter as argument, and should return the parsed value.
	* Useful, for example, to convert numeric values from request params or query strings, that are received as strings, to real numbers.
* `auth` - This method will be executed to check if the user has enough permissions to perform an operation. Can be a function, or a string that defines which authorization role function has to be executed. If this method is not defined, the api resource will be available for all users. Read [Authentication](#authentication) for further info.
	* Arguments:
		* userData - The decoded data about the user that is making the request.
		* params - Request parameters. `params.path` and `params.query`.
		* body - Request body
	* Returns: 
		* Promise.resolve, or `true` to validate the user.
		* Any other returned value will result in a "Forbidden" response.

```js
service.server.addOperations({
  myApiOperation: {
    auth: (userData, params, body) => {
      if (userIsAllowed(userData)) {
        return Promise.resolve()
      }
      return Promise.reject()
    },
    handler: (params, body, res, userData) => {
      res.status(201)
      res.header('location', '/api/books/new-book')
      return Promise.resolve({
        hello: 'world'
      })
    },
    parse: {
      params: {
        id: (id) => {
          return parseInt(id, 10)
        }
      },
      query: {
        page: (page) => {
          return parseInt(page, 10)
        }
      }
    }
  }
})
```

### Custom middlewares

`service.server.addMiddleware(expressMiddleware)`

Custom express middlewares can be added. Will be added before all other internal middlewares, such as operation handlers.

```js
service.server.addMiddleware((req, res, next) => {
  console.log('Executing middleware before operation')
  next()
})
```


[back to top](#table-of-contents)

---

## Client

Make requests to other _Domapic_ services. Automatic authentication and error handling is provided.

```js
domapic.Service().then(service => {
  const client = new service.client.Connection('http://localhost:3000')
  return client.get('/about').then(response => {
    console.log(response)
  })
})
```

```js
// Client with two authentication methods example
domapic.Service().then(service => {
  const client = new service.client.Connection('http://localhost:3000',{
    apiKey: 'thisIsaFooApiKey',
    jwt: {
      user: 'fooUserName',
      password: 'fooPassword'
    }
  })
  return client.get('/about').then(response => {
    console.log(response)
  })
})
```

[back to top](#table-of-contents)

---

## Traces

There are six different levels of traces. Depending of the choiced log level when started the service, the trace will be printed to the console and written to the daily file or not.

All traces in a day are saved to a file, into `~/.domapic/<serviceName>/logs/<serviceName>.<date>.log`. Trace files older than ten days are automatically deleted.

When the service is started at background using the built-in CLI, logs are also saved to a file at `~/.domapic/<serviceName>/logs/<serviceName>.pm2.log`. It is recommended to install [_PM2 log rotate_](https://github.com/keymetrics/pm2-logrotate) to avoid this file growing too much.

Sorted tracer levels are: 'log', 'trace', 'debug', 'info', 'warn' and 'error'.

Tracer usage:

```js
domapic.Service().then(service => {
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
domapic.Service().then(service => {
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

[back to top](#table-of-contents)

---

## Errors

Custom errors constructors are provided through the `service.errors` object.

Custom errors usage:

```js
const Promise = require('bluebird')

domapic.Service().then(service => {
  return Promise.reject(new service.errors.BadData('Received bad data'))
    .catch(service.errors.BadData, () => {
      console.log('Bad data error caught')
      throw new service.errors.BadImplementation()
    })
})
```

Consult [all available error constructors](lib/bases/core/Errors.js) and its correspondences with html errors.

In addition to error constructors, three methods are provided in the `errors` object. These methods are used internally by _domapic-base_ in order to map the returned errors to HTML errors and viceversa:

* `isControlled` - Allows to know if error has been created with a custom error constructor
	* `service.errors.isControlled(error)`
	
```js
const error = new service.errors.Conflict()
console.log(service.errors.isControlled(error))
// true

error = new Error()
console.log(service.errors.isControlled(error))
// false
```

* `FromCode` - Returns an error created with the constructor correspondent to the provided html error status code:
	* `service.errors.FromCode(code, message [, stack] [, extraData])`
	
```js
return Promise.reject(service.errors.FromCode(403, 'Custom message'))
  .catch(service.errors.Forbidden, error => {
    console.log('Forbidden error caught')
    console.log(error.message)
    // Custom message
  })
```

* `toHTML` - Returns a [_Boomified_](https://www.npmjs.com/package/boom) error correspondent to the used error constructor. Each error constructor is mapped to an specific status code, ready to be returned by the API:
	* `service.errors.toHTML(error)`

```js
const error = service.errors.Forbidden()
console.log( service.errors.toHTML(error).output.payload.statusCode )
// 403
```

[back to top](#table-of-contents)

---

## Storage

Storage methods read and save json data from a file stored as `~/.domapic/<serviceName>/storage/service.json`.

```js
service.storage.set('fooProperty', {test: 'testing'})
  .then(() => {
    return service.storage.get('fooProperty')
  })
  .then(data => {
    console.log(data)
    // {test: 'testing'}
    return service.storage.remove('fooProperty')
  })
```

Methods

* `get` - Read data from storage file.
	* `service.storage.get([key])`
	* Arguments:
		* key - Optional, key of the object to get. If no provided, entire data is returned.
	* Returns: 
		* A promise, resolved with the correspondant data.
* `set` - Save data into the storage file.
	* `service.storage.set([key,] value)`
	* Arguments:
		* key - Optional. Key of the object to set. If no provided, entire data is overwritten by the given value.
		* value - Data to be saved.
* `remove` - Removes a property from the stored object.
	* `service.storage.remove(key)`
	* Arguments:
		* key - Key of the object to be removed.
* `getPath` - Get storage folder.
	* Returns: 
		* A promise, resolved with the absolute path to the storage folder.

[back to top](#table-of-contents)

---

## Utils

Set of utilities:

* `templates`
	* `compile` - Received an object containing a set of `key:'string'`, will use [_Handlebars_](http://handlebarsjs.com/) to compile each string, and return an object with same keys, but containing the compiled templates.
	* `compiled` - Set of precompiled templates, used internally.
```js
const templates = service.utils.templates.compile({
  myTemplate1: 'Value is: {{value}}'
})
console.log(templates.myTemplate1({
  value: 123
}))
// Value is: 123
```
* `cli`
	* `usedCommand` - Used internally by CLI. Returns the command used to start the current process.
* `services` - Set of utilities used internally to normalize services names, etc..

[back to top](#table-of-contents)

---

## Info

Static object containing information about the package, from the `package.json` file.

* `name` - Mandatory. The `package.json` must contain this property.
* `type` - Category of the service. It is defined with an argument when service is created. Possible values when using Domapic packages are `module`, `controller` or `plugin`.
* `version` - Mandatory. The `package.json` must contain this property.
* `description` - Mandatory. The `package.json` must contain this property.
* `homepage`
* `author`
* `license`

```js
console.log(service.info)
```

[back to top](#table-of-contents)

---

## Authentication

The server supports two types of OAUTH authentication methods, with built-in api "login" urls and token validations.

Each authentication strategy need some different methods to be provided in order to be activated. This externally provided methods have the responsibility of checking the user data, and then delegate the rest of the flow into the built-in security modules. In the case of Json Web Token, as the rest of the process is "token-based", this methods will be only invoqued at "login" or "refresh token" points.

To require an authentication method in your API operations, you must define the openapi `security` property in the correspondant API path:

```json
"paths": {
  "/fooOperationPath": {
    "post": {
      "security": [{
        "jwt": []
      }, {
        "apiKey": []
      }]
    }
  }
}
```

Use the server `addAuthentication` method to define your authentication implementations. The parameter must be an object containing keys `jwt`, `apiKey` and/or `disabled`, which will contain the specific configuration for each method:

`service.server.addAuthentication(authConfigObject)`

### Api key

Must contain properties:

* `verify`- Checks if the received api key is still allowed to be used.
	* Arguments:
		* apiKey -  Api key received in the request header.
	* Returns:
		* Promise.resolve(userData) -> Allowed, pass the user data to authorization methods.
		* Rejected promise -> Unauthorized.
* `authenticate` - API operation for requesting a new api key. This api point needs authentication as well, so, if your system  authentication is only api key based, you have to define an initial api key that could be used to request more in case it´s needed. This method supports _Json Web Token_ authentication as well, if it is implemented.
	* `auth` - Authorization method for the `/api/auth/apikey` _POST_ api resource.
		* Arguments:
			* userData - The decoded data about the user that is making the request.
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
	* `handler` - Operation handler for the `/api/auth/apikey` _POST_ api resource.
		* Arguments:
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
			* res - Allows to set custom headers and statusCode to response. Examples: `res.status(201)`, `res.header('location', '/api/books/new-book')`
			* userData - If user is "loged", here will be received the userData returned by the correspondant authentication method `verify` handler.
		* Should return a new api key.
* `revoke` - API operation for removing an api key. This api resource needs authentication as well.
	* `auth` - Authorization method for the `/api/auth/apikey` _DELETE_ api resource.
		* Arguments:
			* userData - The decoded data about the user that is making the request.
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
	* `handler` - Operation handler for the `/api/auth/apikey` _DELETE_ api resource.
		* Arguments:
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
			* res - Allows to set custom headers and statusCode to response. Examples: `res.status(201)`, `res.header('location', '/api/books/new-book')`
			* userData - If user is "loged", here will be received the userData returned by the correspondant authentication method `verify` handler.
		* Any returned value will be ignored, and not exposed to the api response.

Implementation example:

```js
service.server.addAuthentication({
  apiKey: {
    verify: apiKey => {
      // Check if apiKey is allowed, and return correspondant user data, or reject.
      return getUserDataFromApiKey(apiKey)
    },
    authenticate: {
      auth: (userData, params, body) => {
        // Check if user is allowed to create a new api key, resolve or reject
        return checkUserPermissionToManageApiKeys(userData)
      },
      handler: (params, body, res, userData) => {
        // Returns a new api key
        return getNewApiKey()
      }
    },
    revoke: {
      auth: (userData, params, body) => {
        // Check if user is allowed to remove an existant api key, resolve or reject
        return checkUserPermissionToManageApiKeys(userData)
      },
      handler: (params, body, res, userData) => {
        // Remove existant api key
        return removeApiKey(body.apiKey)
      }
    }
  }
})
```

### JWT

Properties:

* `secret` - Optional. String used to generate tokens. If not provided, a random secret is used.
* `expiresIn` - Number. Time of tokens expiration time in miliseconds. By default, 300 will be used if this option is not provided. It is not recommended to use a high value for this option. Tokens should expire in short time, and then, refresh tokens should be used to request a new token again.
* `authenticate` - API operation for requesting a new token. Will receive `user` and `password`, or `refreshToken`. Your implementation should be able to identify the user, and then return the correspondant data that will be stored in the _Json Web Token_. Afterwards, the API will use that data in each request to apply the correspondant authorization policy for each api resource. _Refresh Token_ is used to renew the user credentials without providing the user data again when the token expires.
	* `handler` - Operation handler for the `/api/auth/jwt` _POST_ api resource.
		* Arguments:
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
			* res - Allows to set custom headers and statusCode to response. Examples: `res.status(201)`, `res.header('location', '/api/books/new-book')`
		* Should return an object containing `userData` (an object with all user data that will be passed as argument to the API resources authorization handlers), and `refreshToken` if the request has not received it.
* `revoke` - API operation for removing a refresh token. This api resource needs authentication as well, and it only supports the `jwt` authentication method.
	* `auth` - Authorization method for the `/api/auth/jwt` _DELETE_ api resource.
		* Arguments:
			* userData - The decoded data about the user that is making the request.
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
	* `handler` - Operation handler for the `/api/auth/jwt` _DELETE_ api resource.
		* Arguments:
			* params - Request parameters. `params.path` and `params.query`.
			* body - Request body
			* res - Allows to set custom headers and statusCode to response. Examples: `res.status(201)`, `res.header('location', '/api/books/new-book')`
			* userData - If user is "loged", here will be received the userData returned by the correspondant authentication method `verify` handler.
		* Any returned value will be ignored, and not exposed to the api response.

Implementation example:

```js
service.server.addAuthentication({
  jwt: {
    secret: 'thisIsNotaRealTokenSecretPleaseReplaceIt',
    expiresIn: 180,
    authenticate: {
      handler: (params, body, res) => {
        // Check if user has right credentials, or refresh token. Returns user data (with new refresh token if not provided)
        if (body.refreshToken) {
          return getUserDataFromRefreshToken(body.refreshToken)
        }
        return checkUserData({
          name: body.user,
          password: body.password
        }).then((userData) => {
          return createNewRefreshToken(userData)
            .then((refreshToken) => {
              return Promise.resolve({
                userData: userData,
                refreshToken: refreshToken
              })
            })
        })
      }
    },
    revoke: {
      auth: (userData, params, body) => {
        // Check if user is allowed to remove an existant refresh token
        return checkUserPermissionToManageApiKeys(userData)
      },
      handler: (params, body, res, userData) => {
        // Remove existant refresh token
        return removeRefreshToken(body.refreshToken)
      }
    }
  }
})
```

### Disabled

When authentication is disabled for an specific origin because of the `authDisabled`, or `auth` options, the authorization handlers will not be executed. By default, an user with the format `{user: 'anonymous'}` will be passed to action handlers, but you can define your own "disabled" strategy, and return an user of your convenience to be passed.

Properties:

* `verify`- Function that should return the user to be passed to action handlers when authentication is disabled for an specific origin.

Implementation example:

```js
service.server.addAuthentication({
  disabled: {
    verify: () => Promise.resolve({
      name: 'your-auth-disabled-user',
      role: 'your-anonymous-role'
    })
  }
})
```

### Authorization

About authorization, each operation defined in the API can have its own `auth` method, that will receive the decoded user data as argument for each request, allowing to reject or allow an specific request based on your own security policy implementation.

The authorization method is agnostic in relation with the used authentication method, because it only receives the user data, no matter the method used to store or recover this data from the request.

Read more about how to define and use the `auth` methods in the [operations chapter](#operations).

An operation `auth` method can be defined as a function, or as a string that defines which "authorization role" function has to be executed. This "authorization roles" must to be defined in the server, using the `addAuthorization` method:

`service.server.addAuthorization(roleName, authHandler)`

```js
service.server.addAuthorization('fooRoleName', userData => {
  if (roleIsAllowed(userData.role)) {
    return Promise.resolve()
    // Execute the operation handler
  }
  return false
  // Forbidden response
}).then(() => {
  return service.server.addOperations({
    fooOperation: {
      auth: 'fooRoleName',
      handler: () => {
        return {}
      }
    }
  })
})
```

[back to top](#table-of-contents)

---

## Command Line Interface

A built-in CLI is provided, but it needs some steps in your package in order to expose it. Once it is implemented, it allows to start the service in background, managed using [_PM2_][pm2-url]. It also provides logs displaying, and a command to stop the service.
Also an API is at your disposal for defining new commands.

### Implementation

Follow these steps to implement the built-in CLI in your package:

* Create a `/bin/<your-cli-name>` file in your package. The name of the file should be equal to the command name that you want to use for your CLI. The content of this file must be:

```shell
#!/usr/bin/env node
require('../cli/index')
```

* Add a `bin` property to your `package.json`, and add an npm script to allow using the CLI through npm alternatively:

```json
  "bin": {
    "your-cli-name": "./bin/your-cli-name"
  },
  "scripts": {
    "your-cli-name": "./bin/your-cli-name"
  }
```

* Create a `/cli/index.js` file in your package. It must contains the CLI initialization:

```js
const path = require('path')
const domapic = require('domapic-base')

domapic.cli({
  script: path.resolve(__dirname, '..', 'server.js')
})
```
The `script` parameter must be the path to the file where you have your service initialization. This will be the process that will be started in background.

### Usage

Once you have installed globally your package, you´ll have the CLI available from command line. If not installed globally, all available commands can be executed as well using npm scripts, or executing directly the `/bin/your-cli-name` file. Next, the `start` example include the different invocation methods examples.

Default available commands are:

* `help`

```shell
your-cli-name help
# Displays help

your-cli-name start --help
# Displays help for start command
```

* `start` - Starts the service process in background. A custom name for the process instance can be provided as first argument, or using the `--name` option.

```shell
// global cli
your-cli-name start fooName --logLevel=debug
```

```shell
// npm script
npm run your-cli-name start fooName -- --logLevel=debug
```

```shell
// bin execution
./bin/your-cli-name start fooName --logLevel=debug
```

All available options for the `start` command are described in the [options chapter](#options) of this documentation.

* `stop` - Stops a background service instance:

```shell
your-cli-name stop

## If name was provided when started, if must be provided to stop:
your-cli-name stop fooName
```

* `logs` - Displays logs of a background service instance:

```shell
your-cli-name logs
# Displays logs

your-cli-name logs --lines=300
# Displays 300 last lines of logs (30 by default, if option is not provided)

## If name was provided when started, if must be provided to stop:
your-cli-name logs fooName --lines=300
```

### Custom options and commands

* Custom configuration
	A `customConfig` property can be defined in initialization object in order to define the custom options of your service:

```js
const path = require('path')
const domapic = require('domapic-base')
const customConfig = require('./customConfig')

domapic.cli({
  script: path.resolve(__dirname, '..', 'server.js'),
  customConfig: customConfig
})
```

Read more about how to define them in the [Custom options chapter](#custom-config)

* Custom commands
	A `customCommands` property can be defined in initialization object in order to extend the CLI features. It must be an object, whose keys will be the names of the custom commands. Each command must have properties:

	* `processName` - _String_. A reference name for the core in order to save the command default configuration, etc... As examples: `service`, `logs`, etc...
	* `describe` - Description for the command. Used when displaying help.
	* `cli` - Command name and arguments expression. [_Yargs_][yargs-url] is used as underlayer to manage commands, so you can read its documentation for more details about how to define them.
	* `options` - Available options for the command. All commands will inherit the options `name`, `color`, `logLevel`, `path` and `saveConfig`. Read [_Yargs_][yargs-url] documentation for further info about defining your own options.
	* `command` - Handler function that will be executed when command is invoqued.
		* Arguments:
			* `config` - An object containing default config, extended with stored config and extended with explicitly defined options in the command execution.
			* `cliUtils` - A set of methods:
				* `tracer` - A `tracer` object, as [described here](#traces).
				* `errors` - An `errors` object, as [described here](#errors).
				* `config` - A `config` object, as [described here](#get-config).
				* `utils` - An `utils` object, as [described here](#utils).
				* `process` - An object that allows to manage the related `script` property _pm2_ process instance related to provided mandatory option `--name`. It has methods:
					* `start` - Starts the process.
					* `stop` - Stops the process.
					* `logs` - Displays out logs while are being received.

	Example of custom command definition:

```js
const path = require('path')
const domapic = require('domapic-base')

domapic.cli({
  script: path.resolve(__dirname, '..', 'server.js'),
  customCommands: {
    restart: {
      processName: 'stopCustom',
      describe: 'Example of a custom command',
      cli: 'stopCustom <fooOption1>',
      options: {
        fooOption2: {
          type: 'boolean',
          describe: 'Foo option for command example',
          default: true
        }
      },
      command: (config, cliUtils) => {
        return cliUtils.tracer.info(JSON.stringify(config))
          .then(() => {
            cliUtils.process.stop()
          })
      }
    }
  }
})
```

Example of custom command usage:

```shell
your-cli-name stopCustom value1 --fooOption2=false --name=testing
# Will display configuration for the custom command, and then stop the process of script "server.js" with name "testing"
```

[back to top](#table-of-contents)

---

## Test Suites

This package uses [Narval][narval-url] as test suites runner.

Different test suites are included, categorized in "unit", "integration", and "end-to-end" tests. For further details, read the `.narval.yml`, and, if needed, you can learn more about Narval configuration at [its own documentation][narval-url].

Run tests:

```shell
npm test
```

[back to top](#table-of-contents)

[domapic-base-logo-image]: http://domapic.com/assets/domapic-logo.png

[coveralls-image]: https://coveralls.io/repos/github/domapic/domapic-base/badge.svg
[coveralls-url]: https://coveralls.io/github/domapic/domapic-base
[travisci-image]: https://travis-ci.org/domapic/domapic-base.svg?branch=master
[travisci-url]: https://travis-ci.org/domapic/domapic-base
[last-commit-image]: https://img.shields.io/github/last-commit/domapic/domapic-base.svg
[last-commit-url]: https://github.com/domapic/domapic-base/commits
[license-image]: https://img.shields.io/npm/l/domapic-base.svg
[license-url]: https://github.com/domapic/domapic-base/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/domapic-base.svg
[npm-downloads-url]: https://www.npmjs.com/package/domapic-base
[npm-dependencies-image]: https://img.shields.io/david/domapic/domapic-base.svg
[npm-dependencies-url]: https://david-dm.org/domapic/domapic-base
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=domapic-base&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=domapic-base
[release-image]: https://img.shields.io/github/release-date/domapic/domapic-base.svg
[release-url]: https://github.com/domapic/domapic-base/releases
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

[website-image]: https://img.shields.io/website-up-down-green-red/http/domapic.com.svg?label=domapic.com
[website-url]: http://domapic.com/

[pm2-url]: http://pm2.keymetrics.io/
[yargs-url]: https://www.npmjs.com/package/yargs
[narval-url]: https://www.npmjs.com/package/narval
[domapic-controller-url]: https://npmjs.com/domapic-controller
[domapic-service-url]: https://npmjs.com/domapic-service
