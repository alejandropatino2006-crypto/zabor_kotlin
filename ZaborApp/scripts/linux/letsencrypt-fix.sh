#!/bin/sh
echo "Fixing letsencrypt"
cd /app
mkdir -p letsencrypt && mkdir -p /etc/letsencrypt
tar --use-compress-program zstd -xf letsencrypt.tar.zstd -C ./letsencrypt
rm -f ./letsencrypt/cli.ini && cp -r ./letsencrypt/* /etc/letsencrypt && rm -r ./letsencrypt

rm -f /etc/letsencrypt/live/www.zaboreats.com/*.pem
ln -s /etc/letsencrypt/archive/www.zaboreats.com/privkey1.pem /etc/letsencrypt/live/www.zaboreats.com/privkey.pem
ln -s /etc/letsencrypt/archive/www.zaboreats.com/cert1.pem /etc/letsencrypt/live/www.zaboreats.com/cert.pem
ln -s /etc/letsencrypt/archive/www.zaboreats.com/chain1.pem /etc/letsencrypt/live/www.zaboreats.com/chain.pem
ln -s /etc/letsencrypt/archive/www.zaboreats.com/fullchain1.pem /etc/letsencrypt/live/www.zaboreats.com/fullchain.pem
echo "done"
