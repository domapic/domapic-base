# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

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

