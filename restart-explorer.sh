#!/bin/bash

# Move to your app directory
cd /home/ubuntu/containers/explorer/urban-explorer/

# Rebuild and restart the container
/usr/bin/docker-compose down
/usr/bin/docker-compose build --no-cache
/usr/bin/docker-compose up -d