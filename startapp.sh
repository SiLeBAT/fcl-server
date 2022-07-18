#!/bin/bash

source ./environment.sh

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./logs/fcl.log
fi

export FCL_LOG=$LOG_FILE

npx pm2 kill --no-daemon
npx pm2 start pm2.config.js
