<template>
  <div id="stake-default-staked-staked" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">TOTAL PROJECTS</div>
          <div class="content">
            <div class="normal-text-bold">
              {{options.stakedProjects.length}}
            </div>
            <div class="normal-text">
              <highlight>New projects</highlight> are introduced on a regular basis. <i class="el-icon-search"></i>
            </div>
            <br />
            <div class="buttonArea" style="text-align: center;">
              <el-button type="primary" round size="mini" style="width: 250px;" @click="addMore">Add projects</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">DEPOSIT</div>
          <div class="content">
            <div class="normal-text-bold">
              {{toFixed(options.deposit)}} SOTE
            </div>
            <div class="normal-text">
              Remember that you can stake your total deposit up to <highlight>10 times.</highlight> <svg-icon icon-class="Money"></svg-icon>
            </div>
            <br />
            <div class="buttonArea" style="text-align: center;">
              <div>
                <el-button type="primary" plain round size="mini" style="width: 120px;" @click="withdrawDeposit">Withdraw</el-button>
                <el-button type="primary" round size="mini" style="width: 120px;" @click="addMore('deposit')">Increase</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header">AVAILABLE FOR STAKING</div>
          <div class="content">
            <div class="normal-text-bold">
              {{toFixed(availableStaking)}} SOTE
            </div>
            <div class="normal-text">
              <highlight>Leverage</highlight> your deposit for more rewards by staking your available SOTE. <svg-icon icon-class="broken-line"></svg-icon>
            </div>
            <br />
            <div class="buttonArea" style="text-align: center;">
              <el-button type="primary" round size="mini" style="width: 250px;" @click="addMore('deposit')">Stake</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <br />
    <el-row :gutter="20">
      <el-col :span="8" style="margin-bottom: 20px;">
        <el-card class="box-card">
          <div slot="header">AVAILABLE REWARDS</div>
          <div class="content">
            <div class="normal-text-bold">
              {{toFixed(options.rewards)}} SOTE
            </div>
            <div class="normal-text">
              Withdraw staking rewards.
            </div>
            <br />
            <div class="buttonArea" style="text-align: center;">
              <el-button :disabled="options.rewards == 0" type="primary" round size="mini" style="width: 250px;" @click="withdrawRewards">Withdraw</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" style="margin-bottom: 20px;">
        <el-card class="box-card">
          <div slot="header">UNSTAKED AMOUNT PENDING</div>
          <div class="content">
            <div class="normal-text-bold">
              {{toFixed(unstaked)}} SOTE
            </div>
            <div class="normal-text">
              Unstaking takes 90 days. Check pending unstaked amounts under history.
            </div>
            <br />
            <div class="buttonArea" style="text-align: center;">
              <div>
                <el-button type="primary" plain round size="mini" style="width: 120px;" @click="history">History</el-button>
                <el-button type="primary" round size="mini" style="width: 120px;" @click="unstake">Unstake</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" style="margin-bottom: 20px;">
        <el-card class="box-card" style="display: none;">
          <div slot="header">PROJECTS PERFORMANCE</div>
          <div class="content">
            <div class="normal-text-bold">
              N/A
            </div>
            <div class="normal-text">
              Unknown
            </div>
            <br />
            <div class="buttonArea" style="text-align: center;">
              <el-button :disabled="true" type="primary" round size="mini" style="width: 250px;">View all</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <projects :options="options" />
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'
import projects from '@/views/stake/common/projects'
import PooledStakingContract from '@/services/PooledStaking'

export default {
  components:{
    projects
  },
  props: ["options"],
  data() {
    return {
      PooledStaking: null,
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
    availableStaking(){
      const staked = this.options.stakedProjects.map(item => item.ownerStaked).reduce((total, item) => BigNumber(total?total:0).plus(item?item:0));
      return BigNumber(this.options.deposit).multipliedBy(this.settings.stake.maxAmount.toString()).minus(staked).toString();
    },
    unstaked(){
      return this.options.stakedProjects.map(item => item.unstaked).reduce((total, item) => BigNumber(total?total:0).plus(item?item:0)).toString();
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
      this.PooledStaking = await this.getContract(PooledStakingContract);
    },
    toFixed(value){
      return BigNumber(value).toFixed(2, 1);
    },
    addMore(param){
      this.options.redirect = "deposit";
      this.$router.push({name: "StakeStake", params: JSON.parse(JSON.stringify(this.options))});
    },
    withdrawDeposit(){
      this.$router.push({name: "WithdrawDeposit", params: JSON.parse(JSON.stringify(this.options))});
    },
    withdrawRewards(){
      this.loading = true;
      const instance = this.PooledStaking.getContract().instance;
      instance.withdrawReward(this.member.account, { from: this.member.account }).then(res => {
        this.loading = false;
        this.$message.success("Withdraw successfully");
        this.$emit("refresh", "rewards");
      }).catch(e => {
        this.$message.error(e.message);
        this.loading = false;
      })
    },
    unstake(){
      this.$router.push({name: "Unstake", params: JSON.parse(JSON.stringify(this.options))});
    },
    history(){
      this.$router.push({name: "UnstakeHistory", params: JSON.parse(JSON.stringify(this.options))});
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-default-staked-staked{
  .content{
    line-height: 30px;
    min-height: 160px;
    position: relative;
    .buttonArea{
      text-align: center;
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 280px;
    }
  }
  .icon-name {
    margin-right: 10px;
  }
}
</style>
