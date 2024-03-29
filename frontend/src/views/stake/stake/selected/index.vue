<template>
  <div id="stake-stake-selected">
    <el-card :style="{top: top+'px'}">
      <div slot="header" class="clearfix">
        <highlight>{{titles[options.active > 3 ? 3 : options.active]}}</highlight>
        <span class="toggle-btn secondary-text" :class="{'expand': expand}" @click="expand=!expand" v-if="showExpandBtn">
          <i class="el-icon-arrow-down"></i>{{ expand ? 'Put away' : 'Open up' }}
        </span>
      </div>
      <div class="mb20">
        <selected v-if="options.active==0" :options="options" :expand="device!=='mobile' || expand"/>

        <projectSummary v-if="options.active==1" :options="options" />

        <agreement v-if="options.active==2" :options="options" />

        <confirmation v-if="options.active>2" :options="options" />
      </div>
      <div style="text-align: center;">
        <el-button type="primary" plain round size="small" @click="back" ref="back">Back</el-button>
        <el-button type="primary" :disabled="!isContinue" round size="small" @click="next" ref="next">{{options.active>2 ? "Confirm Stake" : "Continue"}}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import selected from './selected';
import projectSummary from './summary';
import agreement from './agreement';
import confirmation from './confirmation';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    selected, projectSummary, agreement, confirmation
  },
  props: ["options"],
  data() {
    return {
      titles: ["Selected", "Summary", "Agreement", "Confirmation"],
      top: 0,
      isContinue: false,
      expand: false
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings',
      'device'
    ]),
    // 已经stake的总和
    usedAmount(){
      // 计算总和
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return this.options.selectedProject.map(item=>BigNumber(item.stake).plus(item.ownerStaked))
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    // 判断有没有不符合最小stake金额的合约
    isMin(){
      return this.options.selectedProject.filter(item=>BigNumber(item.stake.toString()).plus(item.ownerStaked)
            .comparedTo(this.settings.stake.minAmountPerContract)<0).length > 0;
    },
    //判断有没有大于deposite的合约
    moreThanDeposited() {
      return this.options.selectedProject.filter(item=>BigNumber(item.stake.toString()).plus(item.ownerStaked)
            .comparedTo(this.perAmountShow)>0).length > 0;
    },
    // 列表中所有合约的最大stake值
    maxPerAmount(){
      // 取最大值
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return BigNumber(this.options.selectedProject.map(item=>BigNumber(item.stake.toString()).plus(item.ownerStaked))
                             .reduce((max, item)=> item ? (max>item? max : item) : (max?max:0))).toString();
    },
    showExpandBtn() {
      return this.device==='mobile' && this.options.active==0 && this.options.selectedProject.length > 1
    },
    // 每个合约目前允许的最大金额
    perAmountShow(){
      const depositAmount = this.options.perAmount || 0
      return BigNumber(depositAmount).plus(this.options.totalAmount).toFixed(2, 1);
    }
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
    expandProject() {
      this.expand = true
    },
    next(){
      this.$emit("next");
      this.$refs.next.$el.blur();
    },
    back(){
      this.$emit("back");
      this.$refs.back.$el.blur();
    },
    checkContinue(){
      if(this.options.active == 0){
        if(this.options.selectedProject.length == 0){
          return false;
        }
        return true;
      }
      if(this.options.active == 1){
        if (!this.member.isMember) {
          return false;
        }
        // 首次充值小于20
        const depositAmount = this.options.perAmount || 0
        if(this.options.totalAmount == 0 && BigNumber(depositAmount).comparedTo(this.settings.stake.minAmountPerContract) < 0){
          console.error("首次充值金额不能小于20");
          return false;
        }
        // 单合约的投入大于每笔合约限额（本次充值金额加之前的充值金额，即累计充值金额）
        if(BigNumber(depositAmount).plus(this.options.totalAmount).comparedTo(this.maxPerAmount) < 0){
          console.error("单合约的投入大于每笔合约限额（本次充值金额加之前的充值金额，即累计充值金额）");
          return false;
        }
        // 所有合约投入超过总限额
        if(BigNumber(this.usedAmount.toString()).comparedTo(this.options.maxTotalAmount) > 0){
          console.error("所有合约投入超过累计充值金额的10倍");
          return false;
        }
        // 余额不足
        if(BigNumber(this.$ether(depositAmount)).comparedTo(BigNumber(this.member.balance.toString())) > 0){
          console.error("余额不足");
          return false;
        }
        // 单合约投入不足最低标准
        if(this.isMin){
          console.error("所有新合约stake有不足最低标准的");
          return false;
        }
        if(this.moreThanDeposited) {
          console.error("单个合约stake金额不得超过deposit金额");
          return false;
        }
        return true;
      }
      if(this.options.active == 2){
        return this.options.terms.length == 2;
      }
      if(this.options.active > 2 && !this.member.isMember){
        return false;
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
#stake-stake-selected{
  .el-card{
      position: relative;
      z-index: 1;
  }

  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
}
</style>
