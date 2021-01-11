<template>
  <div id="cover-default">
    <overall/>
    <br/>
    <manage/>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import overall from '@/views/cover/default/overall';
import manage from '@/views/cover/default/manage';

export default {
  components:{
    overall, manage
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
  }
}
</script>
