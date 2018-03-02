 #!/usr/bin/env sh

export test_to_run
export service_to_start
export options_to_use
export command_to_use

test_to_launch=$1
debug_mode=$2
exit_instruction="--exit-code-from test"

if [[ -n "$test_to_launch" && "$debug_mode" = "alive" ]]; then
  exit_instruction=""
fi

function launch_test {
  local test_name=$1
  service_to_start=$2
  command_to_use=$3
  options_to_use=$4
  test_to_run=$5

  if [[ ! -n "$test_to_launch" || (-n "$test_to_launch" && "$test_to_launch" = "$test_name") ]]; then
    echo "Launching integration test \"${test_name}\""
    docker-compose up --build ${exit_instruction}
  fi
}

launch_test "start" "start" "node" "start" "start"
