<template>
  <div id="stake-withdraw-summary" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card :style="{top: top+'px'}">
      <h3 class="main-text">Summary</h3>
      <div style="margin-bottom: 20px;">
        <el-row class="normal-text-bold">
          <span>Staked</span>
          <span style="float: right;">REMAINING</span>
        </el-row>
        <el-progress :text-inside="true" :stroke-width="25" :percentage="percentage" status="exception"></el-progress>
        <el-row>
          <span>{{$toFixed(usedAmount)}} SOTE</span>
          <span style="float: right;">{{$toFixed(maxTotalAmount - usedAmount)}} SOTE</span>
        </el-row>
        <br />
        <el-form label-width="120px" label-position="left">
          <div>
            <highlight>Before</highlight>
          </div>
          <el-form-item label="Deposit:">
            {{$toFixed(options.deposit)}} SOTE
          </el-form-item>
          <div>
            <highlight>After</highlight>
          </div>
          <el-form-item label="Deposit:">
            {{$toFixed(options.deposit - options.withdraw)}} SOTE
          </el-form-item>
        </el-form>
      </div>
      <div style="text-align: center;">
        <el-button type="primary" plain round size="small" @click="back" >Back</el-button>
        <el-button type="primary" :disabled="!isContinue" round size="small" @click="confirm" >Confirm</el-button>
      </div>
    </el-card>
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
      top: 0,
      isContinue: false,
      loading: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    // 已经stake的总和
    usedAmount(){
      // 计算总和
      if(this.options.stakedProjects.length==0){
        return 0;
      }
      return this.options.stakedProjects.map(item=>item.ownerStaked)
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    // 列表中所有合约的最大stake值
    maxPerAmount(){
      // 取最大值
      if(this.options.stakedProjects.length==0){
        return 0;
      }
      return this.options.stakedProjects.map(item=>item.ownerStaked)
                            .reduce((max, item)=> item ? (max>item? max : item) : (max?max:0));
    },
    maxTotalAmount(){
      return BigNumber(this.options.deposit.toString()).multipliedBy(this.settings.stake.maxAmount.toString()).toString();
    },
    percentage(){
      if(this.maxTotalAmount<=0){
        return 0;
      }
      let percent = BigNumber(this.usedAmount).div(this.maxTotalAmount).times(100);
      return percent.gt(100) ? 100 : parseFloat(percent.toFixed(2).toString());
    },
  },
  watch: {
    web3Status: watch.web3Status,
    options: {
      handler(newVal, oldVal){
        this.isContinue = this.checkContinue();
      },
      deep: true,
    }
  },
  created(){
    this.initData();
    window.addEventListener('scroll', this.moveSelected, false)
  },
  destroyed(){
    window.removeEventListener('scroll', this.moveSelected, false);
  },
  methods: {
    initData(){
      this.isContinue = this.checkContinue();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    confirm(){
      this.$emit("confirm");
    },
    back(){
      this.$emit("back");
    },
    checkContinue(){
      const vBN = BigNumber(this.options.withdraw);
      if(vBN.lte(0)){
        this.$message.error('Enter an amount must be greater than 0!');
        return;
      }

      if(vBN.gt(this.$etherToValue(this.options.maxWithdraw))){
        this.$message.error(`You can withdraw ${this.$etherToValue(this.options.maxWithdraw)} SOTE maximum.`);
        return;
      }
      return true;
    },
    moveSelected(e){
      // 根据滚动条移动组件位置
      const el = this.$parent.$el;
      const elTop = el.getBoundingClientRect().top;
      const top = 69 - elTop;
      if(top<0 && this.top==0){
        return;
      }
      this.top = top < 0 ? 0 : top;
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-withdraw-summary{
  h3{
    margin-top: 0px !important;
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
