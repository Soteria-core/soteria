import Web3 from 'web3'
import store from '@/store'
import { WEB3_STATUS } from '@/utils/Constants.js'
import { initMember, getAllowance, getBalance, getWBalance } from '@/api/common.js'
import Bus from '@/utils/eventBus.js'
import { BigNumber } from 'bignumber.js'

export default {
  install : function (Vue, options){
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
        initWeb3: async function(settings){
          Vue.prototype.$settings = settings;
          // Modern dapp browsers...
          if (window.ethereum) {
            this.web3Provider = window.ethereum;
            try {
              console.info("Request account access");
              // Request account access
              await window.ethereum.enable();
            } catch (error) {
              // User denied account access...
              console.error("User denied account access")
              if(error.code == -32002){
                this.Bus.$message.error(error.message);
                return this;
              }
              this.Bus.$message.error("User denied account access");
            }
          }
          // Legacy dapp browsers...
          else if (this.web3) {
            this.web3Provider = this.web3.currentProvider;
          }
          // If no injected web3 instance is detected, fall back to Ganache
          else {
            this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }
          this.web3 = new Web3(this.web3Provider);
          if(window.ethereum){
            this.account = window.ethereum.selectedAddress;
            const defaultNetwork = settings.networkVersion;
            const currentNetwork = this.web3Provider.networkVersion;
            store.dispatch('settings/changeSetting', {key: "currentVersion", value: currentNetwork});
            if(defaultNetwork == currentNetwork){
              // 网络一致时才初始化合约相关的数据
              console.info("Network is current, initializing global events.");
              this.initEvent();
              this.initVueEvent();
              store.dispatch('app/setWeb3Status', WEB3_STATUS.AVAILABLE);
            }else{
              store.dispatch('app/setWeb3Status', WEB3_STATUS.UNAVAILABLE);
            }
          }else{
            store.dispatch('app/setWeb3Status', WEB3_STATUS.UNAVAILABLE);
          }
          store.dispatch('member/setAccount', this.account);
          store.dispatch('app/loadingComplete');
          return this;
        },

        initEvent(){
          this.web3Provider.on("accountsChanged", (accounts)=>{
            if(accounts && accounts.length>0){
              this.Bus.$message.warning("Account changed");
              this.account = accounts[0];
            }else{
              this.Bus.$message("Account disconnect ");
              this.account = null;
            }
            store.dispatch("member/setAccount", this.account);
            // 触发一组事件
            this.Bus.$emitGroup(this.Bus.$EventNames.switchAccount, this.account);
          });
          this.web3Provider.on("networkChanged", ()=>{
            console.info(this.web3Provider.networkVersion);
          });
        },
        initVueEvent(){
          this.Bus.$on(this.Bus.$EventNames.initMember, (vue)=>{
            store.dispatch("member/setLoading", true);
            initMember(vue);
          });
          this.Bus.$on(this.Bus.$EventNames.refreshBalance, (vue)=>{
            getBalance(vue);
            getWBalance(vue);
            this.web3.eth.getBalance(this.account).then((response)=>{
                console.info("Account Balance: ", response.toString());
                store.dispatch("member/setAccountBalance", response.toString());
            });
          });
        },
    };

    var getContract = async function(ContractClass){
      const contractsMap = this.$store.getters.contracts;
      let contractObj = contractsMap[ContractClass.key];
      console.info(ContractClass.key, contractsMap);
      if(!contractObj){
        contractObj = new ContractClass(this);
        await contractObj.initContract();
      }
      this.$store.dispatch('contract/put', contractObj);
      return contractObj;
    }
    function ether(n) {
      let utils = this.$CustomWeb3.web3.utils;
      const bn = new utils.BN(utils.toWei(n, 'ether'));
      return bn.toString();
    }
    // 默认保留小数点后两位
    function etherToNumber(n) {
      if(n!=null && this.$CustomWeb3 && this.$CustomWeb3.web3){
          let utils = this.$CustomWeb3.web3.utils;
          return BigNumber(utils.fromWei(n.toString(), 'ether').toString()).toFixed(2, 1);
      }
      return n;
    }

    // 全部返回
    function etherToValue(n) {
      if(n!=null && this.$CustomWeb3 && this.$CustomWeb3.web3){
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
  }
}
