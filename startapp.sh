#!/bin/bash

LOG_FILE=$1
if [ "$#" -ne 1 ]; then
  LOG_FILE=./fcl_output
fi

forever -l $LOG_FILE -a start lib/main.js
