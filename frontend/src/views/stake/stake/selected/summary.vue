<template>
  <div id="stake-stake-selected-summary" class="secondary-text">
    <el-row>
      <el-form>
        <el-form-item label="Balance">{{$etherToNumber(member.balance)}} SOTE</el-form-item>
      </el-form>
    </el-row>
    <el-progress :text-inside="true" :stroke-width="25" :percentage="percentage" status="exception"></el-progress>
    <el-row>
      <span>{{usedAmountShow}} SOTE</span>
      <span style="float: right;">{{remainingShow}} SOTE</span>
    </el-row>
    <el-row class="normal-text-bold">
      <span>Staked</span>
      <span style="float: right;">REMAINING</span>
    </el-row>
    <el-row class="error" v-if="topupValue > 0">
      <svg-icon icon-class="circle" class="icon-name error-color"></svg-icon>
      Top up with {{topupValueShow}} SOTE or stake {{perAmountShow}} maximum per contract.
      <br/>
      <div style="margin-bottom: 10px;text-align: center;">
        <el-button type="primary" plain round size="small" @click="topUp" style="width:80%;">Top Up</el-button>
      </div>
    </el-row>
    <el-row class="error" v-else-if="isInsufficientFunds">
      <svg-icon icon-class="circle" class="icon-name error-color"></svg-icon>
      Insufficient funds.<br/>
      <div style="margin-bottom: 10px;text-align: center;">
        <el-button type="primary" plain round size="small" @click="buySote" style="width:80%;">Swap Tokens</el-button>
      </div>
    </el-row>
    <el-row class="error" v-else-if="isMin" style="margin-bottom: 10px;text-align: center;">
      <svg-icon icon-class="circle" class="icon-name error-color"></svg-icon>
      Stake {{settings.stake.minAmountPerContract}} SOTE minumum per contract.<br/>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    remainingShow(){
      return BigNumber(this.options.maxTotalAmount).minus(this.usedAmount).toFixed(2, 1);
    },
    // 已经stake的总和
    usedAmount(){
      // 计算总和
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return this.options.selectedProject.map(item=>BigNumber(item.stake).plus(item.ownerStaked))
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    // 已经stake的总和
    usedAmountShow(){
      // 计算总和
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return BigNumber(this.options.selectedProject.map(item=>BigNumber(item.stake).plus(item.ownerStaked))
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0))).toFixed(2, 1);
    },
    // 列表中所有合约的最大stake值
    maxPerAmount(){
      // 取最大值
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return BigNumber(this.options.selectedProject.map(item=>BigNumber(item.stake.toString()).plus(item.ownerStaked))
                             .reduce((max, item)=> item ? (max>item? max : item) : (max?max:0))).toFixed(2, 1);
    },
    percentage(){
      if(this.options.maxTotalAmount<=0){
        return 0;
      }
      let percent = this.usedAmount/parseFloat(this.options.maxTotalAmount)*100;
      return percent > 100 ? 100 : parseFloat(percent.toFixed(2));
    },
    isInsufficientFunds(){
      return BigNumber(this.$ether(this.options.perAmount.toString()).toString()).comparedTo(BigNumber(this.member.balance.toString())) > 0;
    },
    // 判断有没有不符合最小stake金额的合约
    isMin(){
      return this.options.selectedProject.filter(item=>BigNumber(item.stake.toString()).plus(item.ownerStaked)
            .comparedTo(this.settings.stake.minAmountPerContract)<0).length > 0;
    },
    // 需要充值金额
    topupValue(){
      return BigNumber(this.maxPerAmount.toString()).minus(this.perAmount).toFixed(2, 1).toString();
    },
    // 需要充值金额
    topupValueShow(){
      return BigNumber(this.maxPerAmount.toString()).minus(this.perAmount).toString();
    },
    // 每个合约目前允许的最大金额
    perAmount(){
      return BigNumber(this.options.perAmount.toString()).plus(this.options.totalAmount).toString();
    },
    // 每个合约目前允许的最大金额
    perAmountShow(){
      return BigNumber(this.options.perAmount.toString()).plus(this.options.totalAmount).toFixed(2, 1);
    }
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    topUp(){
      this.options.perAmount = this.topupValue.toString();
    },
    buySote(){
      this.$router.push("/start/swap");
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-stake-selected-summary{
  .normal-text-bold{
    line-height: 30px;
  }
  .el-card{
    position: relative;
  }
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
  .el-form-item{
    margin-bottom: 0px;
  }
}
</style>
