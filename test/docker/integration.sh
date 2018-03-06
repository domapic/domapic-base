#!/usr/bin/env bash

source "./run-tests.sh"

launch_test "integration" "built-in-api" "start" "node" "basic"
launch_test "integration" "tracer" "start" "node" "log-level"
