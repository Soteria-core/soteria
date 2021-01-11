<template>
  <div id="cover-default">
    <overall :options="options" />
    <el-divider />
    <becomeAssessor :options="options" v-if="options.staked==0" @refresh="refresh" />
    <div v-else>
      <increase :options="options" @refresh="refresh" />
      <el-divider />
      <extend :options="options" @refresh="refresh" />
    </div>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import overall from './overall';
import becomeAssessor from './becomeAssessor';
import increase from './increase';
import extend from './extend';
import TokenControllerContract from '@/services/TokenController';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    overall, becomeAssessor, increase, extend
  },
  data() {
    return {
      stake: 0,
      TokenController: null,
      options: {
        staked: "0",
        period: "0"
      },
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
      this.TokenController = await this.getContract(TokenControllerContract);
      this.getLocked();
    },
    getLocked(){
      const instance = this.TokenController.getContract().instance;
      instance.tokensLocked(this.member.account, this.$CLA_BYTE).then(res => {
        this.$set(this.options, "staked", res.toString());
        console.info("---options---index---", this.options);
      }).catch(e => {
        console.error(e);
        this.$message.error(e);
      });

      instance.getLockedTokensValidity(this.member.account, this.$CLA_BYTE).then(res => {
        this.$set(this.options, "period", res.toString());
        console.info("----", res, res.toString(), "-----");
      }).catch(e => {
        console.error(e);
        this.$message.error(e);
      });
    },
    staked(stake){
      this.stake = stake;
    },
    refresh(){
      this.getLocked();
    }
  }
}
</script>
