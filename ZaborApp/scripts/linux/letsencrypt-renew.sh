#!/bin/sh
cd /app && certbot renew
sleep 3
cd /etc
tar --use-compress-program zstd -cf /app/letsencrypt.tar.zstd -C ./letsencrypt .
cp /app/letsencrypt.tar.zstd /app/site/zabor-app
echo "done"
echo "now download via SFTP, the file named letsencrypt.tar.zstd from /app/site/zabor-app"
