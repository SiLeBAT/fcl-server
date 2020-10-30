#!/bin/bash

source ./environment.sh

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./fcl_output
fi

BASE_NAME=`basename $LOG_FILE .log`
DIR_NAME=`dirname $LOG_FILE`
ADMIN_LOG=$DIR_NAME/$BASE_NAME-admin.log

NODE_ENV=$FCL_NODE_ENV HOST=$FCL_HOST FCL_API_ROOT=$FCL_API_ROOT forever -l $LOG_FILE -a start ./lib/main.js
