
if [ -d ../../../.tmp ]; then
	mkdir ../../../.tmp
fi

node ../app/$service_to_start/server.js --name=service --path=../../../.tmp ${options}