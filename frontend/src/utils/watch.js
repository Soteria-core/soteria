export const watch = {
  "web3Status": function(newVal, oldVal){
    if(newVal && newVal === this.WEB3_STATUS.AVAILABLE && this.initData){
      this.initData();
    }
  }
}
