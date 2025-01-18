#!/bin/bash

# Stop all processes when script is stopped
trap 'kill $(jobs -p)' EXIT

# Build JavaScript initially
echo "Building JavaScript..."
npm run build

# Start JavaScript watcher
echo "Starting JavaScript watcher..."
npm run watch &

# Start Jekyll server with development config
echo "Starting Jekyll server..."
bundle exec jekyll serve --config _config.yml,_config.development.yml --livereload  --trace

wait
