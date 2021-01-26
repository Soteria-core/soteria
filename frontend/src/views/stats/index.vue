<template>
  <div id="stats" class="app-container">
    <Cover :options="options"/>
    <CapitalPool :options="options" />
    <Staking :options="options" />
    <Token :options="options" />
  </div>
</template>

<script>
import Cover from "./Cover";
import CapitalPool from "./CapitalPool";
import Staking from "./Staking";
import Token from "./Token";
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import { getBNBQuote, getRate } from '@/api/common.js'

export default {
  components: { Cover, CapitalPool, Staking, Token },
  data() {
    return {
      options: {
        rateBN: 0,
        rate: 0,
        allStaked: 0,
        totalCoverAmount: 0,
      }
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member']),
  },
  watch: {
    web3Status: watch.web3Status
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, ()=>{
      this.initData();
    });
  },
  methods: {
    initData() {
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      getBNBQuote(this);
      const rate = await getRate(this);
      this.options.rateBN = rate.toString();
      this.options.rate = this.$etherToValue(this.options.rateBN);
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
