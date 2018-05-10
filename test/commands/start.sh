#!/usr/bin/env bash

node test/app/start.js --name=service --host=${host_name} --path=${app_path} ${extra_options}
