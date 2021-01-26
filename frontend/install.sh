#!/usr/bin/env bash
set -x
rm dist.tar.gz
set -e

git pull
(rm -rf dist && npm run build:prod)


cp public/data/settingsm.json dist/data/settings.json

tar -zcvf dist.tar.gz dist
