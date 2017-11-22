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

## Table of Contents
___

* [What are Domapic services?](#what-are-domapic-services)
* [Installation](#installation)
* [Usage](#usage)
	* [Start the server](#start-the-server)
	* [Stop the server](#stop-the-server)
* [Configuration](#configuration)
* [Options](#options)
* [Database](#database)
* [Users](#users)
* [Install services](#install-services)
* [Install plugins](#install-plugins)
* [Why?](#why)

## What are Domapic services?
___

Domapic services are domotic (or whatever other) services installed in the same or in another machine, developed in nodejs or any other technology (for the moment, only nodejs base service package is provided), that automatically connect with this controller through API, pair with it, and can receive orders (**ACTIONS**) from it, and communicate events to it (**EVENTS**), to inform that one of its **STATES** has changed.

You can **interact directly with the controller to get STATES, listen EVENTS, or send ACTIONS to all paired services**, but you can also interact directly with any of the services. You can **make interact all services automatically setting up AUTOMATISMs** in the controller.

So, you can install Domapic services in your machine, in your server, in a Raspberry pi, inside or outside your local network... and set them all to use the same controller (installed locally or remote, as well). Then, you can program your own AUTOMATISMs using the controller API, or using a domapic UI plugin, or even using Homekit plugin, Slack plugin, IFTT plugin or whatever other domapic plugin. You will receive notifications when the services STATES change, or you cand send ACTIONS to any service, through the controller API, interfaces, or plugins.

If it does not exists, develop your own plugin or service, and publish it with the suffix "domapic-service", or "domapic-plugin".

//TODO, add schema image

## Suggested uses
___

//TODO, write suggested uses (examples), mention IFTT.. SIRI, etc..

## Installation
___

To run the next commands, [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) must be installed.

```shell
npm install domapic -g
```

Domapic can be installed locally without the -g flag as well, but the global installation is recommended to make easier the use of the provided CLI.

```shell
sudo npm install domapic -g --unsafe-perms
```

> Note: If you have to use "sudo" to install the package globally, use the --unsafe-perms flag in order to start the server pointing to the right user home path for writing configurations, storage, etc.

## Usage
___

### Start the server

```shell
domapic start SERVERNAME
```

You can pass options to the start command:

```shell
domapic start SERVERNAME --port=8090
```

To get help about all CLI available commands and options run:

```shell
domapic --help
#or
domapic COMMAND --help
```

> Note: The CLI will start automatically a [PM2](http://pm2.keymetrics.io/) process with your server instance name. Using PM2 commands you can stop the server process, read the server process logs, etc. For further info, please [read the PM2 docs](http://pm2.keymetrics.io/docs/usage/quick-start/).

To start the controller without using CLI:

```shell
npm start -- --name=SERVERNAME --port=8090
```

```shell
domapic start SERVERNAME --port=8090 --mongodb=mongodb://localhost/domapic
```

### Stop the server

```shell
domapic stop SERVERNAME
```

In the examples above, SERVERNAME should be replaced with your desired controller instance name. If not provided, "domapic" will be the default value. Any number of instances of the server with different aliases can be started at the same time.

## Configuration
___

When the controller server is started, a file is created at *~/.domapic/SERVERNAME/config.json.* You can edit the options directly in that configuration file, and restart the server.

> Note: The server name is related to the folder in which the configuration is saved, so it can not be modified in the configuration file itself. If you want to change the name of your server, rename the configuration folder, and restart the server with the new name option.

## Options
___

option | type | description | default
--- | --- | --- | ---: 
name | String | Controller server name | domapic
port | Number | Http port | 53152
ssl | Boolean | Secured http server | true
mongodb | String | MongoDB connection string URI | 
autosearch | String | Range of IPs in which the controller will look to restore paired services connections | 192.168.1.1-255

## Database
___

Domapic can use [Nedb](https://github.com/louischatriot/nedb) or [MongoDB](https://www.mongodb.com/) as database.

By default, Domapic will use Nedb as database if no "mongodb" option is provided. This was made for making simpler the installation process, and to make able to use it in environments in which you can´t use MongoDB. But, it is better if you install your own MongoDB database and pass the mongodb connection string URI as "mongodb" option to the server.

## Users
___

All the APIs of the Domapic system requires authentication using JSON Web Token.

The Domapic Controller implements a role-based access control. Controller roles are:

role | used by | permissions
--- | --- | --- 
service | Domapic services | Dispatch own events, update own configuration
plugin | Domapic plugins | Interact with all services, interact with controller API points implemented for plugins.
user | Standard users | Interact with all services
admin | System administrators | Full access

To make easier the configuration and connection between services and the controller, all services share the same password. Despite this, each one will be added as a different user when the pairing is executed. Another password is shared between all plugins.

The admin and users has it own password each one, and has to be defined when the user is added.

By default, there is an user with name "admin", and password "12345". The passwords for the *service* and *plugin* roles are 12345 too.
You can add your own users, or modify passwords using the CLI:

```shell
domapic useradd USERNAME -p=PASSWORD -r=admin

#or...
npm run useradd -- --name=USERNAME -p=PASSWORD -r=admin
```

If you want to change the role or password of an existing user using the CLI:

```shell
domapic usermod USERNAME -p=PASSWORD

#or...
npm run usermod -- --name=USERNAME -r=user
```

For deleting an existing user:

```shell
domapic userdel USERNAME
```

> NOTE: All the user-related commands above will only apply to *user* or *admin* roles. The users for *service* and *plugin* roles are added automatically when pairing with them is executed.

You can change the passwords for *service* and *plugin* roles with the commands:

```shell
domapic rolemod ROLENAME -p=PASSWORD

#or...
npm run rolemod -- --name=ROLENAME -p=PASSWORD
```

> NOTE: This command will only apply to *service* or *plugin* roles, which share passwords for all related users.

## Install services or plugins
___

Domapic services or plugins can be developed in any technology if the API is compatible, so, there should not be an unique guide of how to install or to start them. But, for nodejs, two packages called **domapic-service** and **domapic-plugin** are published in NPM to be used as "base" for that domapic pieces. So, for packages extending these "standard" bases, you can follow these basic instructions:

```shell
#Install your desired service

npm i example-domapic-service
#or
sudo npm i example-domapic-service --unsafe-perm

#Start it
npm start -- --name=example --controllerhost=192.168.1.50 --password=12345
```

If no *controllerhost* is provided, the service will search automatically for the controller in a range of IPs (specifiable with the *autosearch* option).

A key will be printed when the service has found the controller. You´ll need to insert that key to allow the pairing in the controller. Use the controller CLI to allow the pairing if you have not already installed an user interface plugin:

```shell
#In the domapic controller:
domapic pair example --key=PROVIDED-SERVICE-KEY
```

Now you have already available the service in the controller, and you can start to interact with it, or program automatisms to make it interact automatically with other services.

To configure it, a file is created at *~/.domapic/SERVICENAME/config.json.* You can edit the options directly in that configuration file, and restart the service.

> NOTE: Read the documentation of each package before install it. This is only a general guide valid for packages developed using the *domapic-service* or *domapic-plugin* base.

For further info, please read the [*domapic-service*] or the [*domapic-plugin*] packages docs.

## Why?
___

Because there are lots of domotic hardwares and softwares in the market right now, and new Iot gadgets are being launched every minute. This is a very interesting scenario, but every provider has it owns mobile app, its own communication standard, or is betting for one or for another candidate for being a domotic standard platform. So, this gadget is not compatible with Homekit, but it is with Samsung Smart Things, the other is the inverse, the other is only with Somfy, the other is not compatible with any other, etc. If you want to control your full house, you´ll have to bet for only one platform, and buy only gadgets compatible with that platform, or you´ll have to install hundred of different applications. And making all interact with the others in a simple way, is almost impossibe.

Then, I decided to develop a **"base wrapper" for all home automation gadgets, which was easy to adapt to any requirement, and exposed its features in a standard way, with few lines of code**. The Domapic Controller, which provides an unified entry point to all paired services, and can be programmed to make them interact automatically, should be extensible with more complex custom features, and this is for what plugins are intended.

And, of course, you can develop your own robotic or domotic gadgets, deploy it to a Raspberry, Arduino, or whatever, and make them interact with Domapic in the same simple way.

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




