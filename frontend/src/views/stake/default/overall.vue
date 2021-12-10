<template>
  <div id="stake-overall">
    <el-card class="box-card">
      <el-form>
        <el-row>
          <h2 class="main-text">Soteria Staking</h2>
          <el-row type="flex" style="flex-wrap: wrap;" justify="space-between" align="middle">
            <el-col :xs="24" :sm="24" :md="18" class="normal-text" :class="{'mb16': device === 'mobile'}">Earn rewards by staking SOTE on projects you think are secure.</el-col>
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
              <div class="secondary-text mb8">TOTAL STAKED</div>
              <div class="highlight">{{$etherToNumber(options.allStaked)}} SOTE</div>
            </el-col>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">COVER PURCHASED</div>
              <div class="highlight">{{purchasedCover}} BNB</div>
            </el-col>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">TOTAL REWARDS</div>
              <div class="highlight">{{allRewards}} SOTE</div>
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
import QuotationDataContract from "@/services/QuotationData";
import {totalStakingReward} from "@/api/stat";

export default {
  name: "Overall",
  components:{
  },
  props: ["options"],
  data() {
    return {
      purchasedCover: 0,
      QuotationData: null,
      allRewards: 0,
    }
  },
  computed: {
    ...mapGetters([
      'device',
      'web3',
      'member',
      'web3Status',
    ]),
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
      this.getAllRewards();
    },
    async initContract(){
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.getTotalSumAssured();
    },
    getTotalSumAssured() {
      const contract = this.QuotationData.getContract();
      contract.instance.getTotalSumAssured(this.$BNB_BYTE8).then(response => {
        this.purchasedCover = response.toString();
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
      });
    },
    quickstaking(){
      this.$router.push("/system/stake/quickstake");
    },
    staking(){
      this.$router.push({name: "StakeStake", params: {stakedProjects: []}});
    },
    async getAllRewards(){
      await totalStakingReward().then(res => {
        this.allRewards = res.data;
      }).catch(e => {
        this.$message.error(e.message);
      });
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
