<template>
  <div
    id="stake-unstake"
    v-loading.fullscreen.lock="loading"
    element-loading-text="Transaction is confirming ...">
    <el-card class="box-card">
      <div slot="header">
        <highlight>Unstake</highlight>
      </div>
      <div class="normal-text">Choose the projects you no longer want to stake.</div>
    </el-card>
    <el-row :gutter="20" v-if="options">
      <el-col :xs="24" :sm="24" :md="24" :lg="18" class="mb20">
        <unstake :options="options"/>
        <projects :options="options"/>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="6">
        <unstakeSummary class="right-top" :options="options" @confirm="confirm"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {watch} from '@/utils/watch.js';
import {mapGetters} from 'vuex';
import projects from './projects';
import unstake from './unstake';
import unstakeSummary from './summary';
import PooledStakingContract from '@/services/PooledStaking'
import {BigNumber} from 'bignumber.js'

export default {
  components: {
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
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account) => {
      this.initData();
    });
  },
  methods: {
    initData() {
      // 获取路由参数
      const params = this.$route.params;
      if (params && params.stakedProjects) {
        let options = JSON.parse(JSON.stringify(params));
        this.options = options;
        this.options.stakedProjects = params.stakedProjects // 解决前一个页面stakedProjects没加载完，不继续加载问题
      } else {
        this.$router.push("/system/stake/default");
      }

      if (this.web3Status === this.WEB3_STATUS.AVAILABLE) {
        this.initContract();
      }
    },
    async initContract() {
      // 初始化合约
      this.PooledStaking = await this.getContract(PooledStakingContract);
    },
    async confirm() {
      // unstake
      const instance = this.PooledStaking.getContract().instance;
      const unstakingList = this.options.stakedProjects.filter(item => BigNumber(item.unstaking).gt(0));
      const addresses = unstakingList.map(item => item.address);
      const unstakes = unstakingList.map(item => this.$ether(item.unstaking.toString()));
      this.loading = true;
      const [unstakeRequest, reqId] = await Promise.all([
        instance.unstakeRequests(0),
        instance.lastUnstakeRequestId()
      ])
      // 没有修改过unstake期限，所以直接插入链表尾部
      const _insertAfter = unstakeRequest.next.isZero() ? 0 : reqId.toString();
      // console.log(`first: ${unstakeRequest.next.toString()} _insertAfter: ${_insertAfter}`)
      instance.requestUnstake(addresses, unstakes, _insertAfter, {from: this.member.account}).then(res => {
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
#stake-unstake {
  // line-height: 35px;
  .el-card {
    margin-bottom: 20px;
  }
}
</style>
