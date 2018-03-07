cd ../app/$service_to_start

if [ -d ../../../.tmp ]; then
	mkdir ../../../.tmp
fi

node ./server.js --name=service --path=../../../.tmp ${options}