# Sote frontend

[English](./README.md) | 简体中文

> Sote frontend

**Live demo:** 


## Build Setup

```bash
# 克隆项目
git clone https://github.com/devsoteria/sote.git

# 进入项目目录
cd sote/frontend

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装以来，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 增大nodejs内存，避免内存溢出
npm run fix-memory-limit

# 启动服务
npm run dev
```

浏览器访问 [http://localhost:9528](http://localhost:9528)

## 发布

```bash
# 进入项目目录
cd sote/frontend

# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

Copyright (c) 2020-present Peng
