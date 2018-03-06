#!/usr/bin/env bash

export test_to_run
export service_to_start
export command_to_use
export options_to_use

test_to_launch=$1
debug_mode=$2

exit_instruction="--exit-code-from test"

cp ../../package.json ./service/scripts/package.json
cp ../../npm-shrinkwrap.json ./service/scripts/npm-shrinkwrap.json

if [ "$debug_mode" = "alive" ]; then
  exit_instruction=""
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
    docker-compose up --build ${exit_instruction}
  fi
}
