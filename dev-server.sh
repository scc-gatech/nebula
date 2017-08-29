#!/usr/bin/env bash

source env/bin/activate

export FLASK_DEBUG=1
export FLASK_APP=app.py

set -o allexport
source .env
set +o allexport

concurrently --names "CELERY,HTTP,NODE,FLOWER" \
    "celery -A app.celery worker" \
    "flask run" \
    "cd frontend && yarn start" \
    "celery flower -A app.celery"
