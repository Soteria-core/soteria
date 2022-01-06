<template>
  <div id="claim-default-overall">
    <el-card class="box-card">
      <el-row>
        <h2 class="main-text">Claims</h2>
        <el-row type="flex" style="flex-wrap: wrap;" justify="space-between" align="middle">
          <el-col :xs="24" :sm="24" :md="16" class="normal-text" :class="{'mb16': device === 'mobile'}" style="line-height: 24px">Earn rewards by becoming a Soteria Claims Assessor.</el-col>
          <div class="right-area">
            <el-button type="primary" plain round @click="howItWorks">How it works</el-button>
          </div>
        </el-row>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

export default {
  name: "Overall",
  components:{
  },
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
    },
    async initContract(){

    },
    howItWorks(){
      // 查看pdf
      window.open('pdf/SmartContractCoverWording.pdf');
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
