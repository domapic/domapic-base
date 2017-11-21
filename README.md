# Domapic

**DOM**otic **API** services **C**ontroller

Controller server for Domapic services.

[![Build status][circleci-image]][circleci-url]
[![Coverage Status][coverall-image]][coverall-url]
[![js-standard-style][standard-image]][standard-url]
[![Quality Gate][quality-gate-image]][quality-gate-url]

[![Node version][node-version-image]][node-version-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]

[![NPM downloads][npm-downloads-image]][npm-downloads-url]
[![Website][website-image]][website-url]

//TODO, it is too long. Add an well descriptor image, bolds, etc...

## What are Domapic services?
___

Domapic services are domotic (or whatever other) services installed in the same or in another machine, developed in nodejs or any other technology (for the moment, only nodejs base service package is provided), that automatically connect with this controller through API, pair with it, and can receive orders (**ACTIONS**) from it, and communicate events to it (**EVENTS**), to inform that one of its **STATES** has changed.

You can **interact directly with the controller to get STATES, listen EVENTS, or send ACTIONS to all paired services**, but you can also interact directly with any of the services. You can **make interact all services automatically setting up AUTOMATISMs** in the controller.

So, you can install Domapic services in your machine, in your server, in a Raspberry pi, inside or outside your local network... and set them all to use the same controller (installed locally or remote, as well). Then, you can program your own AUTOMATISMs using the controller API, or using a domapic UI plugin, or even using Homekit plugin, Slack plugin, IFTT plugin or whatever other domapic plugin. You will receive notifications when the services STATES change, or you cand send ACTIONS to any service, through the controller API, interfaces, or plugins.

If it does not exists, develop your own plugin or service, and publish it with the suffix "domapic-service", or "domapic-plugin".

## Why?
___

Because there are lots of domotic hardwares and softwares in the market right now, and new Iot gadgets are being launched every minute. This is a very interesting scenario, but every provider has it owns mobile app, its own communication standard, or is betting for one or for another candidate for being a domotic standard platform. So, this gadget is not compatible with Homekit, but it is with Samsung Smart Things, the other is the inverse, the other is only with Somfy, the other is not compatible with any other, etc. If you want to control your full house, you´ll have to bet for only one platform, or you´ll have to install hundred of different applications. And making all interact with the others in a simple way, is almost impossibe.

Then, I decided to develop a **"base wrapper" for all home automation gadgets, which was easy to adapt to any requirement, and exposed its features in a standard way, with few lines of code**. The Domapic Controller, which provides an unified entry point to all paired services, and can be programmed to make them interact automatically, should be extensible with more complex custom features, and this is for what plugins are intended.

And, of course, you can develop your own robotic or domotic gadgets, deploy it to a Raspberry, Arduino, or whatever, and make them interact with Domapic in the same simple way.

## Suggested uses
___

//TODO, write suggested uses (examples), mention IFTT.. SIRI, etc..

## Installation

> Note: To run the next commands, [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) must be installed.

```shell
npm install domapic -g
```

> Note: Domapic can be installed locally without the -g flag as well, but the global installation is recommended to make easier the use of the provided CLI.

```shell
sudo npm install domapic -g --unsafe-perms
```

> Note: If you have to use "sudo" to install the package globally, use the --unsafe-perms flag in order to start the server pointing to the right user home path for writing configurations, storage, etc.

## Usage
___

### Start the server

```shell
domapic start my-home
```

You can pass options to the start command:

```shell
domapic start my-home --port=8090
```

> Note: The CLI will start automatically a PM2 process with your server name ("my-home", in the example above)

Or, without using CLI:

```shell
npm start -- --name=my-home --port=8090
```

```shell
domapic start my-home --port=8090 --mongodb=mongodb://localhost/domapic
```

### Stop the server

```shell
domapic stop my-home
```

In the examples above, "my-home" refers to your controller instance name. If not provided, "domapic" will be the default value. Any number of instances of the server with different aliases can be started at the same time.

## Configuration
___

When the server is started, a file is created at *~/.domapic/[my-name]/config.json.* You can edit the options directly in that configuration file, and restart the server.

> Note: The server name is related to the folder in which the configuration is saved, so it can not be modified in the configuration file itself. If you want to change the name of your server, rename the configuration folder, and restart the server with the new name option.

## Options
___

option | type | description | default
--- | --- | --- | ---: 
name | String | Server name | domapic
port | Number | Http port | 53152
ssl | Boolean | Secured http server | true

## Database
___

Domapic can use Nedb or MongoDB.

By default, Domapic will use Nedb as database if not "mongodb" option is provided. This was made for making simpler the installation process, and to make able to use it in environments in which you can´t use MongoDB. But, it is better if you install your own mongodb database and pass the mongodb connection string URI as "mongodb" option to the server.

## Users
___

//TODO, test if embedded PM2 works as expected, then describe here how to see logs, status, etc... (For testing it, delete PM2 from local, then start the server locally)

## Install services
___

//TODO, link to the domapic-service package. Explain that all services should extend from it, so the guide should be valid for all services installation and configuration process.

[circleci-image]: https://circleci.com/bb/domapic/domapic.svg?style=shield&circle-token=3e836b50c79fdfe6bcaa2f4879037443e2916b44
[circleci-url]: https://circleci.com/bb/domapic/domapic
[coverall-image]: https://coveralls.io/repos/bitbucket/domapic/domapic/badge.svg?branch=master&t=XYh3MA
[coverall-url]: https://coveralls.io/bitbucket/domapic/domapic?branch=master
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




