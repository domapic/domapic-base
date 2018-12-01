# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.0.0-beta.17] - 2018-12-1
### Fixed
- Fix Client scopes problem. Concurrent requests of same method were sharing data.

## [1.0.0-beta.16] - 2018-11-26
### Fixed
- Avoid sharing same responseCustomizator for all requests of same route.

## [1.0.0-beta.15] - 2018-11-25
### Changed
- Use domain dependant absolute url in swagger interface.
- Change openapi servers url property depending of request hostname and port.

### Added
- Add content-security-policy headers to static resources.
- Add referrer-policy and feature-policy headers.
- Add addMiddleware method to server.
- Add rejectUntrusted option.

### Fixed
- Fix error when setting config values as false.
- Do not print service name in cli recommended commands when it is equal to package name.

## [1.0.0-beta.14] - 2018-11-09
### Changed
- Define service type programatically using an option in the Service constructor
- Do not demand name option. Use package name as service name if it is not defined

## [1.0.0-beta.13] - 2018-10-15
### Added
- Add Error constructors for GatewayTimeout and BadGateway

### Fixed
- Avoid escaping characters in traces

## [1.0.0-beta.12] - 2018-10-12
### Changed
- Use cors package to enable cors

### Added
- Use helmet package to improve security

## [1.0.0-beta.11] - 2018-09-29
### Changed
- Avoid encoding url characters in templates
- Do not use requestBody in delete methods

## [1.0.0-beta.10] - 2018-09-28
### Removed
- Remove service url utils
- Remove domapic headers from responses

### Changed
- Resolve client promises with full server response

## [1.0.0-beta.9] - 2018-09-11
### Fixed
- Change "command" by "action" in services urls helper.

## [1.0.0-beta.8] - 2018-08-28
### Fixed
- Pass userData to operation handlers that has not defined an specific auth function.

### Changed
- Add apiKey authentication to jwt remove refresh token api.
- Pass same arguments to authentication handlers than other operation handlers.

## [1.0.0-beta.7] - 2018-08-25
### Added
- Add package-lock
- Add allow methods header
- Pass request data to auth handlers

### Changed
- Allow api resources to be defined without auth method
- Change userName by user in authentication handlers
- Convert all received errors into unathorization errors in jwt authentication method

## [1.0.0-beta.6] - 2018-07-28
### Fixed
- Do not reject promise when process logs receives an stderr
- Use only two first arguments of used npm command to suggest another commands

## [1.0.0-beta.5] - 2018-07-14
### Fixed
- Fix "extend start command options".

## [1.0.0-beta.4] - 2018-07-11
### Fixed
- Look for pm2 binary in node_modules folder at different levels, going up in the tree.

## [1.0.0-beta.3] - 2018-06-27
### Added
- Pass user data to api handlers as fourth argument
- Add apikey auth url utility
- Add timeout to client requests
- Add Error responses components to openapi

## [1.0.0-beta.2] - 2018-06-17
### Added
- Add utilities for abilities urls
- Add actions "parse" method documentation

### Changed
- Upgraded dependencies

### Fixed
- Parse openapi refs for jsonschema validations

## [1.0.0-beta.1]
### Changed
- Use Narval for running tests
- Improve tests coverage
- Change Sonar configuration

## [0.5.0] - 2018-03-31
### Added
- Add Cors headers to server
- Add integration tests
- Add end-to-end tests

### Changed
- Set default hostName configuration as empty string.
- Use "mocha-sinon-chai" dependency
- Unit tests moved from 'test' to 'test/unit'

### Fixed
- Swagger server set to local ip if no hostName is provided.
- Normalize and convert to absolute the "path" option

## [0.4.0] - 2018-02-29
### Added
- Add utilities for services api urls.

### Changed
- Move utility "usedCommand" to "cli.usedCommand".
- Add first "/" to all client requests.
- Changed default port to 3000

### Fixed
- Fix readme links.

## [0.3.1] - 2018-02-24
### Added
- Add config.set documentation.

## [0.3.0] - 2018-02-24
### Added
- Add set method to config.
- Increased unit tests coverage.

### Fixed
- Fix async tests pattern in Config, Arguments and Process unit tests.

## [0.2.1] - 2018-02-22
### Fixed
- Ensure response was received before save status code

## [0.2.0] - 2018-02-22
### Added
- Package info available from service.
- Improved client errors traces.
- Add utility "serviceType".

### Changed
- Move utility "utils.process.getUsedCommand" to "utils.usedCommand"
- Promesify Service creation errors

## [0.1.2] - 2018-02-18
### Added
- Add role and reference options to apiKey creation resource.

### Fixed
- Ensure that no core options are overridden with custom options.
- Do not warn authentication disabled for an api resource when one authentication method is available.

## [0.1.1] - 2018-02-17
### Added
- Add coveralls badge
- Core objects full unit tests coverage

### Changed
- Ignore node_modules in Sonar-scanner

### Fixed
- For package info, read the property "homepage" from package.json, not "homePage".

## [0.1.0] - 2018-02-14
### Added
- First package version

