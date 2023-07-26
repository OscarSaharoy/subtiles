#!/usr/bin/env bash

export port=${1:-8000}

python3 -m http.server "$port" &> /dev/null &

