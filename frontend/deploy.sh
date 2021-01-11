#!/usr/bin/env bash
set -x
rm dist.tar.gz
set -e

git pull
(rm -rf dist && npm run build:prod && rm -rf dist/pdf)

./goto.sh $1


exit
#cp dist/data/settings$1.json dist/data/settings.json
#
#tar -zcvf dist.tar.gz dist
#
#ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 "rm -rf /home/centos/dist; rm /home/centos/dist.tar.gz"
#
#scp -i ~/Downloads/other-mongo.pem dist.tar.gz centos@18.166.235.68:/home/centos
#
#ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 "cd /home/centos; tar -zxvf dist.tar.gz; cp -rf pdf dist/"
#
#exit
ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68

ssh -i ~/Downloads/linshi linshi@13.70.3.247
ssh -i ~/3.pem linshi@13.70.3.247

scp -i ~/Downloads/other-mongo.pem ~/Downloads/linshi centos@18.166.235.68:/home/centos


#
#rm -rf dist
#
#ssh -i ~/Downloads/other-mongo.pem centos@18.166.235.68 "cd /home/centos; tar -zxvf dist.tar.gz; cp -rf pdf dist/"
#
