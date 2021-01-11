# Sote frontend

English | [简体中文](./README-zh.md)

> Sote frontend

**Live demo:** 


## Build Setup

```bash
# clone the project
git clone https://github.com/devsoteria/sote.git

# enter the project directory
cd sote/frontend

# install dependency
npm install

# set nodejs memory, avoid out of memory
npm run fix-memory-limit

# develop
npm run dev
```

This will automatically open http://localhost:9528

## Build

```bash
# enter the project directory
cd sote/frontend

# build for test environment
npm run build:stage

# build for production environment
npm run build:prod

# copy all files to web work dir
cp -r dist/* /usr/nginx/html

```

Copyright (c) 2020-present Peng
