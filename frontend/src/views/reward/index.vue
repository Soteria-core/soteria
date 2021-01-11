<template>
  <div id="reward" class="app-container" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card class="box-card">
      <h2>Soteria Rewards</h2>
      <el-row type="flex" justify="space-between" align="middle">
        <el-col :span="6">You have {{$etherToNumber(member.rewards)}} SOTE available</el-col>
        <el-col :span="4"><el-button type="primary" round class="withdraw-btn" @click="withdrawAll">Withdraw all</el-button></el-col>
      </el-row>
    </el-card>
    <channel />
  </div>
</template>

<script>
import Channel from "@/views/reward/Channel";
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import {getRewards} from "@/api/member";
import ClaimsRewardContract from '@/services/ClaimsReward.js';

export default {
  components: { Channel },
  data() {
    return {
      loading: false,
      ClaimsReward: null,
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member']),
  },
  watch: {
    web3Status: watch.web3Status
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, ()=>{
      this.initData();
    });
  },
  methods: {
    initData() {
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.getRewards();
        this.initContract();
      }
    },
    async initContract(){
      this.ClaimsReward = await this.getContract(ClaimsRewardContract);
    },
    getRewards(){
      getRewards(this);
    },
    withdrawAll(){
      this.loading = true;
      const instance = this.ClaimsReward.getContract().instance;
      instance.claimPendingReward(20, { from: this.member.account }).then(res => {
        this.$message.success("Withdraw all successfully.");
        this.getRewards();
        this.loading = false;
      }).catch(e => {
        this.$message.error(e.message);
        this.loading = false;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
  #reward {
    .box-card {
      margin-bottom: 20px;
    }
    .withdraw-btn {
      width: 100%;
    }
  }
</style>
