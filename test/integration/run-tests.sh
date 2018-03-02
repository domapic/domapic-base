 #!/usr/bin/env bash

export service_to_start="start"
export command_to_use="node"
export options_to_use="start"
export test_to_run="start"

docker-compose up --build --exit-code-from test
