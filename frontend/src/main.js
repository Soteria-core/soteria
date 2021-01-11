import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/element-variables.scss'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css
import '@/iconfont/iconfont.js'
import '@/iconfont/iconfont.css'

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import web3 from '@/plugins/web3.js'
import utils from '@/plugins/utils.js'
import Fragment from 'vue-fragment'
import vueSkeleton from 'vue-skeleton-antd';
import CustomComponents from '@/components/CustomComponents'
import elTableInfiniteScroll from 'el-table-infinite-scroll';
import { BigNumber } from 'bignumber.js';

// 默认为20，超过20位就变成科学计数了，导致数据转换错误，设置100，超过100位才显示为科学计数
BigNumber.config({ EXPONENTIAL_AT: 100 })

Vue.use(CustomComponents);

Vue.use(vueSkeleton)

Vue.use(Fragment.Plugin)

Vue.use(web3);

Vue.use(utils);

Vue.use(elTableInfiniteScroll);

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
