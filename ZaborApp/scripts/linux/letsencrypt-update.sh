#!/bin/sh
scriptsFolder=/mnt/e/_WORKS/zabor/zabor-app/scripts
siteFolder=/mnt/e/_WORKS/zabor/zabor-app/site
processDownloaded=false

#if [ -f "$siteFolder/letsencrypt.tar.zstd" ]; then
#  echo "letsencrypt.tar.zstd found in $siteFolder"
#  processDownloaded=true
#fi

if [ $processDownloaded = true ]; then
  mv $siteFolder/letsencrypt.tar.zstd $scriptsFolder
  cd $scriptsFolder
  mkdir -p letsencrypt
  tar --use-compress-program zstd -xf letsencrypt.tar.zstd -C ./letsencrypt
fi

cd $scriptsFolder
rm -f ./letsencrypt/.updated*.txt ./letsencrypt/options-ssl-nginx.conf ./letsencrypt/ssl-dhparams.pem
tar --use-compress-program zstd -cf ./letsencrypt.tar.zstd -C ./letsencrypt .
cp  $scriptsFolder/letsencrypt.tar.zstd $siteFolder
echo "done"
echo "now upload via SFTP, the file named letsencrypt.tar.zstd from $siteFolder"
#/mnt/e/_WORKS/zabor/zabor-app/scripts/linux/letsencrypt-update.sh
