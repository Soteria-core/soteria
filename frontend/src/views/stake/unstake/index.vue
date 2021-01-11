<template>
  <div id="stake-unstake" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card class="box-card">
      <div slot="header"><highlight>Unstake</highlight></div>
      Choose the projects you no longer want to stake.
    </el-card>
    <el-row :gutter="20" v-if="options">
      <el-col :span="18">
        <unstake :options="options"/>
        <projects :options="options"/>
      </el-col>
      <el-col :span="6">
        <unstakeSummary class="right-top" :options="options" @confirm="confirm"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import projects from './projects';
import unstake from './unstake';
import unstakeSummary from './summary';
import PooledStakingContract from '@/services/PooledStaking'
import QuotationDataContract from '@/services/QuotationData'
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    projects, unstake, unstakeSummary
  },
  data() {
    return {
      loading: false,
      PooledStaking: null,
      options: null,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
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
      // 获取路由参数
      const params = this.$route.params;
      if(params && params.stakedProjects){
        let options = JSON.parse(JSON.stringify(params));
        this.options = options;
      } else {
        this.$router.push("/system/stake/default");
      }

      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      // 初始化合约
      this.PooledStaking = await this.getContract(PooledStakingContract);
    },
    async confirm(){
      // unstake
      const instance = this.PooledStaking.getContract().instance;
      const unstakingList = this.options.stakedProjects.filter(item => BigNumber(item.unstaking).gt(0));
      const addresses = unstakingList.map(item => item.address);
      const unstakes = unstakingList.map(item => this.$ether(item.unstaking.toString()));
      this.loading = true;
      const reqId = await instance.lastUnstakeRequestId();
      const curId = BigNumber(reqId.toString()).lte(0) ? 0 : reqId.toString();
      console.info("requestUnstake: ", addresses, unstakes, curId);
      instance.requestUnstake(addresses, unstakes, curId, { from: this.member.account }).then(res => {
        console.info(res, res.toString());
        this.$message.success("Transaction successfully");
        this.loading = false;
        this.$router.push("/system/stake/default");
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
#stake-unstake{
  // line-height: 35px;
  .el-card {
    margin-bottom: 20px;
  }
}
</style>
