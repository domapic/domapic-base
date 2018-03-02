 #!/usr/bin/env bash

export service_to_start="start"
export command_to_use="node"
export options_to_use="basic"
export test_to_run="basics"

docker-compose up --build --exit-code-from test

sudo chattr -i .config_volume/.domapic
sudo rm -rf .config_volume/.domapic
service_to_start="start"
command_to_use="node"
options_to_use="log-level"
test_to_run="tracer"

docker-compose up --build --exit-code-from test
