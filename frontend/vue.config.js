'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

require('events').EventEmitter.defaultMaxListeners = 0;

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'Soteria' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 9528 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    hot: true,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      ["/quote-api"]: {
        target: "http://api.soteria.fund/v1",
        changeOrigin: true,
        pathRewrite: {
          ['^/quote-api']: ''
        }
      }
    }
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置
      // config.plugins.delete('UglifyJS')
      // config.plugin("ParallelUglifyPlugin")
      //   .use(ParallelUglifyPlugin).tap(() => [
      //     {
      //       cacheDir: '.cache/',
      //       // 传递给 UglifyJS的参数如下：
      //       uglifyJS: {
      //         output: {
      //           /*
      //            是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，
      //            可以设置为false
      //           */
      //           beautify: false,
      //           /*
      //            是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
      //           */
      //           comments: false
      //         },
      //         compress: {
      //           /*
      //            是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用
      //            不大的警告
      //           */
      //           warnings: false,

      //           /*
      //            是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
      //           */
      //           drop_console: true,

      //           /*
      //            是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不
      //            转换，为了达到更好的压缩效果，可以设置为false
      //           */
      //           collapse_vars: true,

      //           /*
      //            是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成
      //            var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
      //           */
      //           reduce_vars: true
      //         }
      //       }
      //     }
      // ]);
    }
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
