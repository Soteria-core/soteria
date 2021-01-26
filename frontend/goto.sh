#!/usr/bin/env bash
set -o errexit
set -x
set -a
set -m

cp public/data/settings$1.json dist/data/settings.json

tar -zcvf dist.tar.gz dist > /dev/null

ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 "rm -rf /home/centos/dist; rm /home/centos/dist.tar.gz"

scp -i ~/Downloads/other-mongo.pem dist.tar.gz centos@18.166.235.68:/home/centos

ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 "cd /home/centos; tar -zxvf dist.tar.gz > /dev/null; cp -rf pdf dist/"

exit
scp -i ~/Downloads/other-mongo.pem centos@18.166.235.68:/data/app/nginx/conf/nginx.conf .
