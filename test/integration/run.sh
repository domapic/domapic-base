#!/usr/bin/env bash

launch_test "built-in-api" "start" "node" "basic"
down_docker_volumes
launch_test "tracer" "start" "node" "log-level"
