<template>
  <div id="claim-assess-denied">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Assessment verdict</highlight>
      </div>
      <div class="secondary-text">
        Based on your answers, this claim should be
        <highlight red>denied</highlight>
        because the following requirements were note met:
      </div>
      <div class="denied-reason">
        <div v-if="options.criteria.incident=='no'">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          An incident should have occured during the period the cover was active.
        </div>
        <div v-if="options.criteria.bebore=='yes'">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          The bug was publicly disclosed before the cover period began.
        </div>
        <div v-if="options.criteria.loss=='no'">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          There should have been a total material loss due to the incident of at least 20% of the cover amount.
        </div>
        <div v-if="options.criteria.unintended=='no'">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          The incident should have been the direct result of the smart contract code being used in an unintended way.
        </div>
        <div v-if="options.criteria.hacks=='yes'">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          The loss of funds should not have occurred due to phishing,
          private key security breaches, malware, exchange hacks or any other activity where
          the covered smart contract continued to act as intended.
        </div>
        <div v-if="options.criteria.exteranal=='yes'">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          The incident should not have occurred due to inputs external to the smart contract system,
          that behaved in an unintended ways, but the smart contract system continued to operate as intended.
          (Where inputs include but are note limited to: oracles, governance systems, incentive structures,
          miner behaviour and network congestion.)
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

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
    }
  }
}
</script>

<style lang="scss" scoped>
#claim-assess-denied{
  line-height: 35px;
  .secondary-text{
    line-height: 35px;
  }
  .right-btn{
    float: right;
    margin-bottom: 20px;
  }
  .divider{
    text-align: center;
  }
  .content {
    color: #606266;
  }
  .li-highlight[red]{
    color: #F56C6C;
  }
  .denied-reason{
    color: #F56C6C;
  }
}
</style>
