#!/bin/bash

echo "Fixing letsencrypt"
sh /app/letsencrypt-fix.sh

# setup SFTP
adduser -D -G nginx -h /app/site/zabor-app zaborAppFtp01
echo "zaborAppFtp01:zabor#Ftp_2025" | chpasswd

addgroup ssh-users
adduser zaborAppFtp01 ssh-users

chown root:root /app/site
chmod 755 /app/site
chown -R zaborAppFtp01:nginx /app/site/zabor-app
chmod ug+rwX /app/site/zabor-app

# Start SSHD
echo "Starting SSHD server for SFTP"
/usr/sbin/sshd -f /etc/ssh/sshd_config
#/usr/sbin/sshd -f /etc/ssh/sshd_config -D -d -e

chown -R zaborAppFtp01:nginx /app/site/zabor-app
chmod ug+rwX /app/site/zabor-app

#echo "threads-max: "
#cat /proc/sys/kernel/threads-max
#echo "pid_max: "
#cat /proc/sys/kernel/pid_max
#echo "file-max: "
#cat /proc/sys/fs/file-max
#echo "max_user_watches: "
#cat /proc/sys/fs/inotify/max_user_watches
#echo "max_user_instances: "
#cat /proc/sys/fs/inotify/max_user_instances
#echo "max_queued_events: "
#cat /proc/sys/fs/inotify/max_queued_events
#echo "limits.conf: "
#cat /etc/security/limits.conf
#echo "ulimit -aH: "
#ulimit -aH

# start nginx
echo "Starting Nginx server"
echo -e "\n* soft stack 102400" >> /etc/security/limits.conf
nginx -c /etc/nginx/nginx.conf -t
nginx -V 2>&1 | tr ' ' '\n' | grep '_module'
nginx -c /etc/nginx/nginx.conf
#nginx -c /etc/nginx/nginx.conf -s reload

cd /app/site/zabor-app
sh -c 'trap "exit" TERM; while true; do sleep 300; done'
