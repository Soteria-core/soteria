#!/usr/bin/env bash
set -x
rm dist.tar.gz
rm -rf dist
set -e
git pull
npm run build:prod

cp public/data/settingsm.json dist/data/settings.json
tar -zcvf dist.tar.gz dist > /dev/null

cp dist.tar.gz ~/
#scp -i ~/3.pem dist.tar.gz linshi@13.70.3.247:/home/linshi

#scp -i ~/Downloads/other-mongo.pem dist.tar.gz centos@18.166.235.68:/home/centos
