const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  web3: state => state.app.web3,
  web3Status: state => state.app.web3Status,
  loading: state => state.app.loading,
  contracts: state => state.contract.contracts,
  member: state => state.member.member,
  settings: state => state.settings.settings,
  currentVersion: state => state.settings.currentVersion,
}
export default getters
