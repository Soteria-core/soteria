<template>
  <div id="claim-assess-become" v-if="options.staked && options.staked == '0'">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Become a claims assessor</highlight>
      </div>
      <span class="secondary-text">
        To submit this assessment you must become a claims assessor by staking an amount of SOTE for 30 days minimum.
        Your verdict power and rewards are proportional to your stake and for the specified period you can't sell these tokens or use them for other purposes.
        If the Advisory Board deems voting to be fraudulent, they have the power to burn this amount. 
        For more info <el-button type="text">click here</el-button> or for the in-depth documents outlining the mehcanics
        <el-button type="text">click here</el-button>.
      </span>
      <div class="right-btn">
        <el-button round type="primary" @click="become">Become a claims assessor</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { ROUTE_NAMES } from '@/utils/Constants.js';
import TokenControllerContract from '@/services/TokenController';

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
    ]),
  },
  watch: {
    web3Status: watch.web3Status
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
      this.TokenController = await this.getContract(TokenControllerContract);
      this.getLocked();
    },
    become(){
      this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT, params: { defaultTab: "stake" } });
    },
    getLocked(){
      const instance = this.TokenController.getContract().instance;
      instance.tokensLocked(this.member.account, this.$CLA_BYTE).then(res => {
        this.$set(this.options, "staked", res.toString());
      }).catch(e => {
        console.error(e);
        this.$message.error(e);
      });
      
      instance.getLockedTokensValidity(this.member.account, this.$CLA_BYTE).then(res => {
        this.$set(this.options, "period", res.toString());
      }).catch(e => {
        console.error(e);
        this.$message.error(e);
      });
    },
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-assess-become{
  .secondary-text{
    line-height: 35px;
  }
  .right-btn{
    float: right;
  }
  margin-bottom: 20px;
}
</style>
