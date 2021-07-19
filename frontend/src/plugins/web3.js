import Web3 from 'web3'
import store from '@/store'
import WalletConnectProvider from "@walletconnect/web3-provider";
import {WEB3_STATUS, WALLET_TYPE} from '@/utils/Constants.js'
import {initMember, getBalance, getWBalance} from '@/api/common.js'
import Bus from '@/utils/eventBus.js'
import {BigNumber} from 'bignumber.js'

export default {
  install: function (Vue, options) {
    Vue.prototype.WEB3_STATUS = WEB3_STATUS;
    Vue.prototype.$EventNames = Bus.$EventNames;
    Vue.prototype.$Bus = Bus;
    Vue.prototype.$MaxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    Vue.prototype.$settings = null;

    var CustomWeb3 = {
      Bus: Bus,
      web3: null,
      web3Provider: null,
      account: null, //当前用户账户地址
      eventListened: false,
      wEventListened: false,
      initWeb3: async function (settings, type) {
        Vue.prototype.$settings = settings;
        if (type === WALLET_TYPE.WALLET_CONNECT) {
          return await this.walletConnect(settings)
        }
        // console.log('window.ethereum:: ', window.ethereum);
        if (!window.ethereum) {
          this.Bus.$message.error('No provider was found, Please check if the wallet exists!')
          return this
        }

        this.web3Provider = window.ethereum;
        const { networkVersion, chainId } = this.web3Provider
        let currentVersion = networkVersion || chainId;
        if (!this.checkNetwork(currentVersion)) {
          return this
        }

        // 拥有 Metamask 特性的钱包获取用户地址
        if (window.ethereum.isMetaMask || window.ethereum.isImToken) {
          try {
            await this.web3Provider.request({method: 'eth_requestAccounts'})
          } catch (error) {
            this.Bus.$message.error(error.message);
            return this;
          }
        }

        this.account = this.web3Provider.selectedAddress || this.web3Provider.address;
        this.web3 = new Web3(this.web3Provider);
        if (!this.eventListened) {
          this.eventListened = true
          this.initEvent();
          this.initVueEvent();
        }
        store.dispatch('settings/changeSetting', {key: "currentVersion", value: currentVersion});
        store.dispatch('app/setWeb3Status', WEB3_STATUS.AVAILABLE);
        store.dispatch('member/setAccount', this.account);
        return this;
      },
      walletConnect: async function () {
        // console.log('connect walletConnect...');
        const {networkVersion, rpcUrl} = Vue.prototype.$settings;
        this.web3Provider = new WalletConnectProvider({
          rpc: {
            [networkVersion]: rpcUrl
          }
        });
        this.web3Provider.chainId = networkVersion
        let accounts = []
        try {
          accounts = await this.web3Provider.enable();
        } catch (error) {
          this.Bus.$message.error(error.message);
          return this
        }
        this.account = accounts[0];
        this.web3 = new Web3(this.web3Provider);
        if (!this.wEventListened) {
          this.wEventListened = true
          this.initWEvent();
          this.initVueEvent();
        }
        store.dispatch('settings/changeSetting', {key: "currentVersion", value: networkVersion});
        store.dispatch('app/setWeb3Status', WEB3_STATUS.AVAILABLE);
        store.dispatch('member/setAccount', this.account);
        return this;
      },
      initWEvent() {
        this.web3Provider.on("accountsChanged", (accounts) => {
          console.info('accountsChanged event...');
          this.handleAccountChange(accounts)
        });
        this.web3Provider.on("chainChanged", (chainId) => {
          console.info('chainChanged event...', chainId);
        });
        this.web3Provider.on("disconnect", () => {
          if (this.account) {
            store.dispatch('app/disconnect', {web3: this});
          }
        });
      },
      initEvent() {
        // 切换账户时
        this.web3Provider.on("accountsChanged", (accounts) => {
          console.info('accountsChanged event...');
          this.handleAccountChange(accounts)
        });
        // 切换网络时
        this.web3Provider.on("networkChanged", (chainId) => {
          console.info('networkChanged event...', chainId);
        });
      },
      initVueEvent() {
        this.Bus.$on(this.Bus.$EventNames.initMember, (vue) => {
          store.dispatch("member/setLoading", true);
          initMember(vue);
        });
        this.Bus.$on(this.Bus.$EventNames.refreshBalance, (vue) => {
          if (!this.account) {
            store.dispatch("member/setBalance", 0);
            store.dispatch("member/setWBalance", 0);
            store.dispatch("member/setAccountBalance", 0);
            return
          }
          getBalance(vue);
          getWBalance(vue);
          this.web3.eth.getBalance(this.account).then((response) => {
            // console.info("Account Balance: ", response.toString());
            store.dispatch("member/setAccountBalance", response.toString());
          });
        });
      },
      handleAccountChange(accounts) {
        if (accounts && accounts.length > 0) {
          console.info("Account changed");
          this.account = accounts[0];
        } else {
          console.info("Account disconnect");
          this.account = null;
        }
        store.dispatch("member/setAccount", this.account);
        this.Bus.$emitGroup(this.Bus.$EventNames.switchAccount, this.account); // 触发一组事件
      },
      checkNetwork(chainId) {
        const networkVersion = Vue.prototype.$settings.networkVersion
        return chainId == networkVersion
      },
      disconnect: async function () {
        console.log('disconnect...');
        if (typeof this.web3Provider.disconnect == 'function') {
          await this.web3Provider.disconnect()
        }
        this.handleAccountChange(null)
        return this
      }
    };
    var getContract = async function (ContractClass) {
      const contractsMap = this.$store.getters.contracts;
      let contractObj = contractsMap[ContractClass.key];
      // console.info(ContractClass.key, contractsMap);
      if (!contractObj) {
        contractObj = new ContractClass(this);
        await contractObj.initContract();
      }
      this.$store.dispatch('contract/put', contractObj);
      return contractObj;
    }

    function ether(n) {
      if (!n) {
        return n
      }
      let utils = this.$CustomWeb3.web3.utils;
      const bn = new utils.BN(utils.toWei(n, 'ether'));
      return bn.toString();
    }

    // 默认保留小数点后两位
    function etherToNumber(n) {
      if (n != null && this.$CustomWeb3 && this.$CustomWeb3.web3) {
        let utils = this.$CustomWeb3.web3.utils;
        return BigNumber(utils.fromWei(n.toString(), 'ether').toString()).toFixed(2, 1);
      }
      return n;
    }

    // 全部返回
    function etherToValue(n) {
      if (n != null && this.$CustomWeb3 && this.$CustomWeb3.web3) {
        let utils = this.$CustomWeb3.web3.utils;
        return utils.fromWei(n.toString(), 'ether').toString();
      }
      return n;
    }

    Vue.prototype.$CustomWeb3 = CustomWeb3;
    Vue.prototype.getContract = getContract;
    Vue.prototype.$ether = ether;
    Vue.prototype.$etherToNumber = etherToNumber;
    Vue.prototype.$etherToValue = etherToValue;
    Vue.prototype.toJSON = function () {
      return this
    };
  }
}
