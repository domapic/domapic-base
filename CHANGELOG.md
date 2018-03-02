# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
- Add integration tests

### Changed
- Unit tests moved from 'test' to 'test/unit'

## [0.4.0] - 2017-02-29
### Added
- Add utilities for services api urls.

### Changed
- Move utility "usedCommand" to "cli.usedCommand".
- Add first "/" to all client requests.
- Changed default port to 3000

### Fixed
- Fix readme links.

## [0.3.1] - 2017-02-24
### Added
- Add config.set documentation.

## [0.3.0] - 2017-02-24
### Added
- Add set method to config.
- Increased unit tests coverage.

### Fixed
- Fix async tests pattern in Config, Arguments and Process unit tests.

## [0.2.1] - 2017-02-22
### Fixed
- Ensure response was received before save status code

## [0.2.0] - 2017-02-22
### Added
- Package info available from service.
- Improved client errors traces.
- Add utility "serviceType".

### Changed
- Move utility "utils.process.getUsedCommand" to "utils.usedCommand"
- Promesify Service creation errors

## [0.1.2] - 2017-02-18
### Added
- Add role and reference options to apiKey creation resource.

### Fixed
- Ensure that no core options are overridden with custom options.
- Do not warn authentication disabled for an api resource when one authentication method is available.

## [0.1.1] - 2017-02-17
### Added
- Add coveralls badge
- Core objects full unit tests coverage

### Changed
- Ignore node_modules in Sonar-scanner

### Fixed
- For package info, read the property "homepage" from package.json, not "homePage".

## [0.1.0] - 2017-02-14
### Added
- First package version

