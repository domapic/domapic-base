 #!/bin/bash 

export test_to_run="start"
export service_to_start="start"
export options_to_use="start"
export command_to_use="node"

docker-compose up --build --exit-code-from test
