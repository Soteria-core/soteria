<template>
  <div class="overall">
    <el-row>
      <el-col :xs="24" :sm="12" :md="6" class="mb20">
        <div class="secondary-text mb8">STAKE</div>
        <div class="highlight">{{$etherToNumber(options.staked)}} SOTE</div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" class="mb20">
        <div class="secondary-text mb8">STAKE PERIOD ENDS</div>
        <div class="highlight">{{period}}</div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" class="mb20">
        <div class="secondary-text mb8">AVAILABLE REWARDS</div>
        <div class="highlight">{{$etherToNumber(rewards)}} SOTE</div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" class="mb20">
        <div class="secondary-text mb8">ASSESSMENTS</div>
        <div class="highlight">Unknown</div>
      </el-col>
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
</style>
