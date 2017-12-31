#!/bin/bash
# Installs NGINX on all nodes for Load Balancing and Health Checks
# Installs Python 2.x on all nodes to run ansible scripts
echo('Installing NGINX and Python 2.x on all nodes...')
while IFS='' read -r line || [[ -n "$line" ]]; do
    ssh -n root@$line "apt-get update -y && apt-get install nginx python -y";
done < "./targets.cfg"
