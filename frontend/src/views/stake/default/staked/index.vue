<template>
  <div id="stake-default-staked">
    <overall :options="options"/>
    <br/>
    <staked :options="options" @refresh="refresh"/>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import overall from './overall';
import staked from './staked';

export default {
  components:{
    overall, staked
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
    refresh(params){
      this.$emit("refresh", params);
    }
  }
}
</script>
