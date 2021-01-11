import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import contract from './modules/contract'
import member from './modules/member'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    contract,
    member
  },
  getters
})

export default store
