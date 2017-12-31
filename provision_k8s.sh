#!/bin/bash
source .env;
CMD="kubespray prepare --nodes";
index=0;

# Clones kubespray repository
# Configures intentory.cfg file
while IFS='' read -r line || [[ -n "$line" ]]; do
    let "index++"
    CMD="$CMD node$index[ansible_ssh_host=$line]";
done < "./targets.cfg"

CMD="$CMD --etcds node$MASTERS_NO --masters node$MASTERS_NO"
$CMD -y && kubespray deploy -u root -y;
