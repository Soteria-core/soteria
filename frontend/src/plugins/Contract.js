import TruffleContract from 'truffle-contract'

class Contract {
  constructor(contractJSON, address, vue) {
    this.json = contractJSON;
    this.address = address;
    this.vue = vue;
    this.tc = null;
    this.instance = null;
    this.init();
  }

  init(){
    // 创建一个truffle-contract实例,为了初始化合约对象以及拿到原生链上的Web对象！
    this.tc = TruffleContract(this.json);
    if(!this.vue.$CustomWeb3.account){
      this.vue.$message("Please connect metamask!");
      return;
    }
    this.tc.setProvider(this.vue.$CustomWeb3.web3Provider);
  }

  async newInstance(address){
    if(address){
      this.address = address;
    }
    if(this.instance){
      return this;
    }
    // 2. 将部署的合约地址set到合约实例中，这样当前web3实例就知道和以太坊网络上的哪个合约进行交互。
    try{
      this.instance = await this.tc.at(this.address);
      console.info("Create a new instance");
    }catch(e){
      console.error(e);
      this.vue.$message.error(e.message);
    }
    return this;
  };
}

export default Contract
