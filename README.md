# Domapic

**DOM**otic **API** services **C**ontroller

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

* [What is Domapic?](#what-is-domapic)
* [What are Domapic services?](#what-are-domapic-services)
* [Installation](#installation)
* [Quick start](#quick-start)
	* [Start the server](#start-the-server)
	* [Stop the server](#stop-the-server)
  * [CLI cheatsheet](#cli-cheatsheet)
* [Configuration](#configuration)
* [Options](#options)
* [Database](#database)
* [Users](#users)
* [Install services](#install-services)
* [Install plugins](#install-plugins)
* [Logs](#logs)
* [Suggested uses](#suggested-uses)
* [Why?](#why)

## What is Domapic?
___

Domapic is the name of a system that controls and automatizes services based in an standarized API. This package contains the Controller Server for Domapic systems:

>	**_One Server to rule them all, One Server to find them,_**
>
>	**_One Server to bring them all, and in the automatisms bind them_**

## What are Domapic services?
___

Domapic services are domotic (or whatever other) services installed in the same or in another machine, developed in nodejs or any other technology (for the moment, only nodejs base service package is provided), that automatically connect with this controller through API, pair with it, and can receive orders (**ACTIONS**) from it, and communicate events to it (**EVENTS**), to inform that one of its **STATES** has changed.

You can **interact directly with the controller to get STATES, listen EVENTS, or send ACTIONS to all paired services**, but you can also interact directly with any of the services. You can **make interact all services automatically setting up AUTOMATISMs** in the controller.

//TODO, add schema image

## Installation
___

To run the next commands, [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) must be installed.

```shell
npm install domapic -g
```

Domapic can be installed locally without the -g flag as well, but the global installation is recommended to make easier the use of the provided CLI.

> Note: If you have EPERM problems to install the package globally, use "sudo" and the --unsafe-perms flag in order to start the server pointing to the right user home path for writing configurations, storage, etc.

```shell
sudo npm install domapic -g --unsafe-perms
```

## Quick Start
___

### Start the server

```shell
domapic start SERVERNAME --port=8090
```

All CLI available commands can be executed as well as NPM commands from package installation folder:
```shell
* npm run domapic -- COMMAND SERVERNAME
```

To get help about all CLI available commands and options, read the [CLI Cheatsheet](#cli-cheatsheet), or run:

```shell
domapic --help
#or
domapic COMMAND --help
```

> Note: The CLI will start automatically a [PM2](http://pm2.keymetrics.io/) process with your server instance name. Using PM2 commands you can stop the server process, read the server process logs, etc. For further info, please [read the PM2 docs](http://pm2.keymetrics.io/docs/usage/quick-start/).

To start the controller without using PM2:

```shell
node server.js --name=SERVERNAME --port=8090 // TODO, this is the real entry point. Explain other methods in CLI, which is only an administration tool
# or
npm start -- --name=SERVERNAME --port=8090
```

### Stop the server

```shell
domapic stop SERVERNAME
```

In the examples above, SERVERNAME should be replaced with your desired controller instance name. Any number of instances of the server with different aliases can be started at the same time.

### CLI cheatsheet
___

// TODO, make a table with all commands and available options

## Configuration
___

When the controller server is started, a file is created at *~/.domapic/SERVERNAME/config/server.json.* You can edit the options directly in that configuration file, and restart the server.

> Note: The server name is related to the folder in which the configuration is saved, so it can not be modified in the configuration file itself. If you want to change the name of your server, rename the configuration folder, and restart the server with the new name option.

## Options
___

option | type | description | default
--- | --- | --- | ---: 
name | String | Controller server name | domapic
port | Number | Http port | 53152
ssl | Boolean | Secured http server | true
authDisabled | String | IP or range of IPs where authentication will be disabled | 127.0.0.1
mongodb | String | MongoDB connection string URI | 
autosearch | String | Range of IPs in which the controller will look to restore paired services connections | 192.168.1.1-255
path | String | Path to be used for domapic as home (.domapic path will be created inside) | ~

// TODO, add real options

## Database
___

Domapic can use [Nedb](https://github.com/louischatriot/nedb) or [MongoDB](https://www.mongodb.com/) as database.

By default, Domapic will use Nedb as database if no "mongodb" option is provided. This was made for making simpler the installation process, and to make able to use it in environments in which you can´t use MongoDB. But, it is better if you install your own MongoDB database and pass the mongodb connection string URI as "mongodb" option to the server.

```shell
domapic start SERVERNAME --port=8090 --mongodb=mongodb://localhost/domapic
```

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

By default, there is an user with name "admin", role "admin", and password "12345". The default passwords for the *service* and *plugin* roles are 12345 too.
You can add your own users, or modify passwords using the CLI:

```shell
domapic useradd SERVERNAME --user=USERNAME -p=PASSWORD -r=admin
```

If you want to change the role or password of an existing user using the CLI:

```shell
domapic usermod SERVERNAME --user=USERNAME -p=PASSWORD
```

For deleting an existing user:

```shell
domapic userdel SERVERNAME --user=USERNAME
```

> NOTE: All the user-related commands above will only apply to *user* or *admin* roles. The users for *service* and *plugin* roles are added automatically when the pairing with them is executed.

You can change the passwords for *service* and *plugin* roles with the commands:

```shell
domapic rolemod SERVERNAME --role=ROLENAME -p=PASSWORD
```

// SUGGESTED ROLES: 'admin', 'operator', 'guest'

> NOTE: This command will only apply to *service* or *plugin* roles, which share passwords for all related users.

## Install services or plugins
___

Domapic services or plugins can be developed in any technology if the API is compatible, so, there should not be an unique guide of how to install or to start them. But, for nodejs, two packages called **domapic-service** and **domapic-plugin** are published in NPM to be used as "base" for that domapic pieces. So, for packages extending these "standard" bases, you can follow these basic instructions:

```shell
#Install your desired service
npm i example-domapic-service

#Start it
npm start -- --name=SERVICENAME --controllerhost=192.168.1.50 --controllerSSL=true --ignoreSSLCertErrors=true --controllerPassword=12345 --sslKey=pathTo/sslKey --sslCert=pathTo/sslCert
```

If no *controllerhost* is provided, the service will search automatically for the controller in a range of IPs (specifiable with the *autosearch* option).

A key will be printed when the service has found the controller. You´ll need to insert that key to allow the pairing in the controller. Use the controller CLI to allow the pairing if you have not already installed an user interface plugin:

```shell
#In the domapic controller:
domapic pair SERVICENAME --key=PROVIDED-SERVICE-KEY
```

Now you have already available the service in the controller, and you can start to interact with it, or program automatisms to make it interact automatically with other services.

To configure the service, a file is created at *~/.domapic/SERVICENAME/config.json.* You can edit the options directly in that configuration file, and restart the service.

For further info, please read the [*domapic-service*] or the [*domapic-plugin*] packages docs.

> NOTE: Read the documentation of each package before install it. This is only a general guide valid for packages developed using the *domapic-service* or *domapic-plugin* base.

## Logs
___

You can display logs using the [CLI logs command](#cli-cheatsheet).

Logs are also available in files:

* ~/.domapic/SERVERNAME/logs/SERVERNAME.pm2.logs
  * Stored with ANSI colors, for CLI and HMTL purposes.
  * Only available if the process has been started using the CLI start command.
  * To avoid this file increasing without limits, install [pm2-logrotate](https://github.com/pm2-hive/pm2-logrotate)

* ~/.domapic/SERVERNAME/logs/SERVERNAME.DATE.logs
  * Stored always in plain format, without ANSI colors.
  * This file rotates automatically every day.
  * Only log files for last 10 days are kept.

## Suggested uses
___

You can install Domapic services in your machine, in your server, in a Raspberry pi, inside or outside your local network... and set them all to use the same controller (installed locally or remote, as well). Then, you can program your own AUTOMATISMs using the controller API, or using a domapic UI plugin, or even using Homekit plugin, Slack plugin, IFTT plugin or whatever other domapic plugin. You will receive notifications when the services STATES change, or you cand send ACTIONS to any service, through the controller API, interfaces, or plugins.

* When there is an event called "holidays" in google calendar, shut down the heating and all the lights. Simulate my presence with lights and blinds movements. Start the heating automatically 3 hours before the event finish. 
* At the sunset, light on your garden lights only when you are out, sutdown automatically if you go inside.
* Say "Siri, open the car door" -> Will open the fence, the garage door, and switch on the lights if it is night.
* Send a message to a Slack channel, and an sms to my phone when someone enter to the house and I´m not inside. Start recording the webcams.
* Switch on the automatic watering if it doesn´t rain for more than 3 days.
* Send me an sms if the electric supply goes out for more than 1 hour.
* Restart the router if internet connection has shut down. Send me an sms if it doesn't come back.
* Switch off all lights sending a message through Slack.
* Turn red a Hue bulb when a code repository build has failed.

If it does not exists, develop your own plugin or service, and publish it with the suffix "domapic-service", or "domapic-plugin".

**Summarizing... Control and make interact together Homekit, gadgets from any home automation provider, cloud services, social network services, chat services, IFTT, local softwares, your own developed gadgets or bots... whatever you can imagine.**

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




