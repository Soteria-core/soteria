
const state = {
  contracts: {}
}

const mutations = {
  PUT: (state, contract) => {
    state.contracts[contract.getKey()] = contract;
  },
}

const actions = {
  put({ commit }, contract) {
    commit('PUT', contract)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
