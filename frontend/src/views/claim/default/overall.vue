<template>
  <div id="claim-default-overall">
    <el-card class="box-card">
      <el-row>
        <h2 class="main-text">Claims</h2>
        <span class="normal-text">Earn rewards by becoming a Soteria Claims Assessor.</span>
        <span class="right-area">
          <el-button type="primary" plain round @click="howItWorks">How it works</el-button>
        </span>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { contracts } from '@/settings.js'
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
#claim-default-overall{
  .overall {
    .el-row {
      margin-bottom: 20px !important;
    }
  }
}
</style>
