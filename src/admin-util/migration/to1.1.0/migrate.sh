#!/bin/bash

# To be used with master-data v1.0.0
# Make sure the $CONFIG_DIR points towards the directory containing the environment specific config file
# Make sure the $DATA_DIR points towards the directory containing the appropriate data (see master-data version above)

CONFIG_DIR=../../../../config
DATA_DIR=../../../../data
SCRIPT_DIR=../../scripts

# Importing new Master Data
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/nrls.json