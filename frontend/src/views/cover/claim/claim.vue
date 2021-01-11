<template>
  <div id="cover-claim-claim">
    <el-card>
      <div slot="header" class="clearfix">
        <highlight>{{options.remainingClaims}} claims remaining!</highlight>
      </div>
      <div class="tips normal-text">
        To make the best use of your claim attempts, make sure you fulfill all 
        necessary conditions before submitting.
        <br/>
        You're covered for the following events:
        <ul>
          <li>
            bugs in the solidity code that lead to a material loss of your funds
          </li>
        </ul>
        Check out full details <el-button type="text">here</el-button>.
        <br />
        <highlight>Why is there a submission limit?</highlight>
      </div>
      <div class="tips2 normal-text">
        When you purchased cover, 10% of the purchase price was locked as  a deposit.
        Each time you submit a claim, it costs half of that deposit.
        If the claim is accepted the deposit is returned, otherwise it is burned.
        This means you have two opportunities to submit a claim for ayn given cover.
      </div>
    </el-card>
    <br/>
    <el-card>
      <div slot="header" class="clearfix">
        <highlight>Claims submission process</highlight>
      </div>
      <div class="tips2 normal-text">
        When you submit a claim, members have up to 72 hours to vote whether to accept or reject it. 
        If enough voting power (locked SOTE) and a quorum (number of voters) is reached, the outcome stands.
        Otherwise it is escalated to a full member vote.
        members are free to decide for themselves which way to vote. More details on the process can be found 
        <el-button type="text">here</el-button>.
      </div>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js';

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
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
  },
  destroyed(){
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-claim-claim{
  .tips{
    line-height: 40px;
  }
  .tips2{
    line-height: 28px;
  }
}
</style>
