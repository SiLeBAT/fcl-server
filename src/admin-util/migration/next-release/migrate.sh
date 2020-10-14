#!/bin/bash

# To be used with master-data vX.X.X
# Make sure the $CONFIG_DIR points towards the directory containing the environment specific config file
# Make sure the $DATA_DIR points towards the directory containing the appropriate data (see master-data version above)
CONFIG_DIR=../../../../config
SCRIPT_DIR=../scripts
DATA_DIR=./db

# Importing new Master Data
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/nrls/nrls.json
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/validation-errors/validationerrors.json

# Updating old Institution collection
NODE_CONFIG_DIR=$CONFIG_DIR node ./updateInstituteCollection.js
