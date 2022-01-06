<template>
  <div id="stake-staked-overall">
    <el-card class="box-card">
      <el-form :disabled="!member.isMember">
        <el-row>
          <h2 class="main-text">Soteria Staking</h2>
          <el-row type="flex" style="flex-wrap: wrap;" justify="space-between" align="middle">
            <el-col :xs="24" :sm="24" :md="16" class="normal-text" :class="{'mb16': device === 'mobile'}">Earn rewards by staking SOTE on projects you think are secure.</el-col>
            <div class="right-area">
              <!-- <el-button type="primary" plain round @click="stats">Stats</el-button> -->
              <el-button type="primary" round @click="quickstaking">Quick Stake</el-button>
              <el-button type="primary" plain round @click="staking">Custom Stake</el-button>
            </div>
          </el-row>
          <el-divider></el-divider>
        </el-row>
        <div class="overall">
          <el-row>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">CURRENT STAKED</div>
              <div class="highlight">{{staked}} SOTE</div>
            </el-col>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">DEPOSIT USAGE</div>
              <div class="highlight">{{depositUsage}}%</div>
            </el-col>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">TOTAL REWARDS</div>
              <div class="highlight">{{toFixed(options.rewards)}} SOTE</div>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  name: "Overall",
  components:{
  },
  props: ["options"],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'device',
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    staked(){
      return BigNumber(this.options.stakedProjects.map(item => item.ownerStaked)
        .reduce((total, item) => BigNumber(total?total:0).plus(item?item:0))).toFixed(2, 1);
    },
    depositUsage(){
      const totalDeposit = BigNumber(this.options.deposit).multipliedBy(this.settings.stake.maxAmount.toString());
      return +totalDeposit.toString() ? BigNumber(this.staked).multipliedBy(100).div(totalDeposit).toFixed(2).toString() : 0;
    },
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
    quickstaking(){
      this.$router.push({name: "QuickStake", params: this.options});
    },
    staking(){
      this.$router.push({name: "StakeStake", params: this.options});
    },
    stats(){
      this.$router.push("/system/stake/stats");
    },
    toFixed(value){
      return BigNumber(value).toFixed(2, 1);
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
