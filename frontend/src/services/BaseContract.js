import store from '@/store'
import Contract from '@/plugins/Contract';

class BaseContract {

  constructor(key, json, vue) {
    this.key = key;
    this.json = json;
    this.vue = vue;
    this.contract = null;
  }

  getKey(){
    return this.key;
  }
  getJson(){
    return this.json;
  }
  getVue(){
    return this.vue;
  }

  getContract(){
    return this.contract;
  }
  async initContract(flag){
    const contracts = store.getters.settings.contracts;
    // flag = true, 强制初始化
    if(this.contract && this.contract.instance && !flag){
      console.info("Return old instance");
      return this.contract;
    }
    this.contract = new Contract(this.getJson(), contracts[this.getKey()], this.vue);
    if(!this.contract.instance){
      await this.contract.newInstance();
    }
    console.info(`Instance contract ${this.getKey()}`);

    return this.contract;
  }
}

export default BaseContract
