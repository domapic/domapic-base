#!/usr/bin/env bash

export test_to_run
export service_to_start
export command_to_use
export options_to_use

test_to_launch=$1
develop=false
build=""

develop_option="--develop"
build_option="--build"
compose_options=""
compose_up_options="--exit-code-from test"

cp ../../package.json ./service/scripts/package.json
cp ../../npm-shrinkwrap.json ./service/scripts/npm-shrinkwrap.json

if [ "$2" = "$develop_option" ] || [ "$3" = "$develop_option" ]; then
  develop=true
fi

if [ "$1" = "$build_option" ] || [ "$2" = "$build_option" ] || [ "$3" = "$build_option" ]; then
  build="--build"
fi

if [ $develop = true ]; then
  compose_options="-f docker-compose.yml -f docker-compose-develop.yml"
  compose_up_options=""
fi

function launch_test {
  test_type=$1

  test_to_run=$2
  service_to_start=$3
  command_to_use=$4
  options_to_use=$5

  if [ ! $test_to_launch ] || [ "$test_to_launch" = "$test_to_run" ]; then
    echo "Launching ${test_type} test \"${test_to_run}\""
    docker-compose down --volumes
    set -e
    docker-compose ${compose_options} up ${build} ${compose_up_options}
  fi
}
