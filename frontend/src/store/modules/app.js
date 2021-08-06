import Cookies from 'js-cookie'
import {WALLET_TYPE, WEB3_STATUS} from '@/utils/Constants.js'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  web3: null,
  web3Status: WEB3_STATUS.UNAVAILABLE,
  loading: false, //应用初始化中，请等待
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_WEB3: (state, web3) => {
    state.web3 = web3
  },
  SET_WEB3_STATUS: (state, status) => {
    state.web3Status = status
  },
  LOADING_COMPLETE: (state) => {
    state.loading = false
  },

}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  async setWeb3({ commit }, {web3, settings, type}) {
    await web3.initWeb3(settings, type)
    console.info("Init web3 finished", web3.account);
    if (web3.account) {
      localStorage.setItem('connectorId', type || WALLET_TYPE.INJECTED)
    }
    commit('SET_WEB3', web3);
  },
  setWeb3Status({ commit }, status) {
    commit('SET_WEB3_STATUS', status);
  },
  async disconnect({ commit }, {web3}) {
    localStorage.removeItem('connectorId')
    await web3.disconnect()
  },
  loadingComplete({ commit }) {
    commit('LOADING_COMPLETE');
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
