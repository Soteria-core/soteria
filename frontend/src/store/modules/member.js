
const state = {
  member: {
    account: null,
    isMember: false,
    loading: false,
    balance: 0, // 当前SOTE余额
    wbalance: 0, // 当前wSOTE余额
    accountBalance: 0, // 当前metamask账户的BNB余额
    // 购买保单cover所有花费,Cover deposits: QuotationData合约getAllCoversOfUser(address _add)拿到用户持有的coverid,
    // 通过getCoverPremiumSOTE(uint _cid)遍历coverid用户支付的SOTE总数，求和得到该数据。
    coverDeposit: 0,
    /**
     * 当前处于理赔评估的SOTE
     * Cliam assessment: TokenController合约tokensLocked(address _of, bytes32 _reason)获取lock数量。
     * _reason为"CLA"的byte表示0x434c41；tokensUnlockable(address _of, bytes32 _reason) 获取可withdraw数量
     */
    assessment: 0,
    withdrawAssessment: 0,
    /**
     * Pooled staking: 用stakerContractsArray, stakerContractStake两个接口获取所有合约当前stake数量，再计算总数
     */
    pooledStaking: 0,
    /**
     * 显示stake的total deposit数量
     */
    stakeDeposit: 0,
    withdrawStakeDeposit: 0,
    /**
     * Rewards: ClaimsReward合约getAllPendingRewardOfUser(address _add)
     */
    rewards: 0,
  }
}

const mutations = {
  SET_MEMBER: (state, member) => {
    state.member = member;
  },
  SET_ACCOUNT: (state, account) => {
    state.member.account = account;
  },
  SET_STATUS: (state, isMember) => {
    state.member.isMember = isMember;
  },
  SET_LOADING: (state, loading) => {
    state.member.loading = loading;
  },
  SET_BALANCE: (state, balance) => {
    state.member.balance = balance;
  },
  SET_WBALANCE: (state, wbalance) => {
    state.member.wbalance = wbalance;
  },
  SET_ACCOUNT_BALANCE: (state, accountBalance) => {
    state.member.accountBalance = accountBalance;
  },
  CHANGE_MEMBER: (state, { key, value }) => {
    if (state.member.hasOwnProperty(key)) {
      state.member[key] = value
    }
  }
}

const actions = {
  setMember({ commit }, member) {
    commit('SET_MEMBER', member)
  },
  setAccount({ commit }, account) {
    commit('SET_ACCOUNT', account)
  },
  setStatus({ commit }, isMember) {
    commit('SET_STATUS', isMember)
  },
  setLoading({ commit }, loading) {
    commit('SET_LOADING', loading)
  },
  setBalance({ commit }, balance) {
    commit('SET_BALANCE', balance)
  },
  setWBalance({ commit }, wbalance) {
    commit('SET_WBALANCE', wbalance)
  },
  setAccountBalance({ commit }, accountBalance) {
    commit('SET_ACCOUNT_BALANCE', accountBalance)
  },
  changeMember({ commit }, data) {
    commit('CHANGE_MEMBER', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
