<template>
  <div id="claim-assess-submit">
    <accepted v-if="isAccept" :options="options" />
    <denied v-else :options="options" />
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import accepted from './accepted';
import denied from './denied';

export default {
  components:{
    accepted, denied
  },
  props: ["options"],
  data() {
    return {
      criteria: {
        incident: "yes",
        bebore: "no",
        unintended: "yes",
        hacks: "no",
        exteranal: "no",
        loss: "yes"
      },
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
    isAccept(){
      const criteria = this.options.criteria;
      for(let p in criteria){
        if(this.criteria[p] != criteria[p]){
          return false;
        }
      }
      
      return true;
    }
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
    },
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-assess-submit{

}
</style>
