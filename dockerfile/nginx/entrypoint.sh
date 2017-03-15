#!/bin/bash
CONFIG_DIR="/etc/nginx"
BACKUP_DIR="/etc/nginx_backup/*"
shopt -s nullglob dotglob
files=(/etc/nginx/*)
# look for empty dir
if [ ! ${#files[@]} -gt 0 ]; then
    cp -a $BACKUP_DIR $CONFIG_DIR
    echo "Copy to Configuration files"
fi
echo "nginx start"
nginx -g "daemon off;"