<template>
  <div id="cover-default">
    <overall/>
    <br/>
    <manage :defaultTab="defaultTab"/>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import overall from './overall';
import manage from './manage';

export default {
  components:{
    overall, manage
  },
  data() {
    return {
      defaultTab: "claims"
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
      this.defaultTab = this.$route.params.defaultTab ? this.$route.params.defaultTab : "claims";
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      
    },
  }
}
</script>
