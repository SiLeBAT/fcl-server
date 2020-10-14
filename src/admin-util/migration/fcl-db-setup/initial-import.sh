#!/bin/bash

# To be used with master-data v0.1.0
# Make sure the $CONFIG_DIR points towards the directory containing the environment specific config file
# Make sure the $DATA_DIR points towards the directory containing the appropriate data (see master-data version above)

CONFIG_DIR=../../../../config
DATA_DIR=../../../../data
SCRIPT_DIR=../scripts

NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/states.json
NODE_CONFIG_DIR=$CONFIG_DIR  node $SCRIPT_DIR/importCollection.js $DATA_DIR/einrichtungen.txt
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/validationerrors.json
NODE_CONFIG_DIR=$CONFIG_DIR node $SCRIPT_DIR/importCollection.js $DATA_DIR/nrls.json
