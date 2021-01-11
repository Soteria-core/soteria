<template>
  <div class="overall">
    <el-row class="secondary-text" :gutter="20">
      <el-col :span="6">STAKE</el-col>
      <el-col :span="6">STAKE PERIOD ENDS</el-col>
      <el-col :span="6">AVAILABLE REWARDS</el-col>
      <el-col :span="6">ASSESSMENTS</el-col>
    </el-row>
    <el-row class="highlight" :gutter="20">
      <el-col :span="6">{{$etherToNumber(options.staked)}} SOTE</el-col>
      <el-col :span="6">{{period}}</el-col>
      <el-col :span="6">{{$etherToNumber(rewards)}} SOTE</el-col>
      <el-col :span="6">Unknown</el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ClaimsRewardContract from '@/services/ClaimsReward';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
      rewards: "0",
      ClaimsReward: null,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
    period(){
      return this.$secondsToDateString(parseInt(this.options.period));
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
      this.ClaimsReward = await this.getContract(ClaimsRewardContract);
      this.getRewards();
    },
    getRewards(){
      const instance = this.ClaimsReward.getContract().instance;
      instance.getRewardToBeDistributedByUser(this.member.account).then(res => {
        this.rewards = res.toString();
      }).catch(e => {
        console.error(e);
        this.$message.error(e);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.overall {
  .el-row {
    margin-bottom: 20px !important;
  }
}
</style>
