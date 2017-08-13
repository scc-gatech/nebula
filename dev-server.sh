#!/usr/bin/env bash

export FLASK_DEBUG=1
export FLASK_APP=app.py

set -o allexport
source .env
set +o allexport

flask run
