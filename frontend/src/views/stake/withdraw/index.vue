<template>
  <div id="stake-withdraw" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card class="box-card">
      <div slot="header"><highlight>Withdraw stake</highlight></div>
      You can withdraw any unused SOTE from your deposit.
    </el-card>
    <el-row :gutter="20" v-if="options">
      <el-col :span="18">
        <withdraw :options="options" ref="withdraw"/>
        <projects :options="options"/>
      </el-col>
      <el-col :span="6">
        <withdrawSummary class="right-top" :options="options" @confirm="confirm" @back="back"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import projects from '@/views/stake/common/projects';
import withdraw from './withdraw';
import withdrawSummary from './summary';
import PooledStakingContract from '@/services/PooledStaking'
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    projects, withdraw, withdrawSummary
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
        options.withdraw = '';
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
      this.getWithdraw();
    },
    getWithdraw(){
      const instance = this.PooledStaking.getContract().instance;
      instance.stakerMaxWithdrawable(this.member.account).then(res => {
        this.options.maxWithdraw = res.toString();
        this.$refs.withdraw.$forceUpdate();
      });
    },
    confirm(){
      const instance = this.PooledStaking.getContract().instance;
      const amount = this.$ether(this.options.withdraw);
      this.loading = true;
      instance.withdraw(amount, { from: this.member.account }).then(res => {
        console.info(res, res.toString());
        this.$message.success("Transaction successfully");
        this.loading = false;
        this.$router.push("/system/stake/default");
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    },
    back(){
      this.$router.go(-1);
    }
  }
}
</script>
<style lang="scss" scoped>
#stake-withdraw{
  // line-height: 35px;
  .el-card {
    margin-bottom: 20px;
  }
}
</style>
