#!/usr/bin/env sh
set -u

#appEnvironment=$(grep APP_ENV /app/site/zabor-app/.env | cut -d '=' -f2)
#echo "APP_ENV: $appEnvironment"
echo -n 'Reloading nginx... '
nginx -c /etc/nginx/nginx.conf -s reload

#ret=$?
#if [ $ret -ne 0 ]; then
#	echo failed
#	exit $ret
#fi
echo done
