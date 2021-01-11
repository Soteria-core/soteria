<template>
  <div id="stake-history" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card class="box-card">
      <div slot="header"><highlight>Unstake history</highlight></div>
      All your unstake requests will show up here.
    </el-card>
    <el-row :gutter="20" v-if="options">
      <el-col :span="18">
        <history :options="options"/>
      </el-col>
      <el-col :span="6">
        <historySummary class="right-top" :options="options"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import history from './history';
import historySummary from './summary';
import PooledStakingContract from '@/services/PooledStaking'
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    history, historySummary
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
    async queryHistory(){

    }
  }
}
</script>
<style lang="scss" scoped>
#stake-history{
  // line-height: 35px;
  .el-card {
    margin-bottom: 20px;
  }
}
</style>
