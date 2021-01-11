<template>
  <div id="cover-claim-details">
    <el-card>
      <div slot="header" class="clearfix">
        <highlight>Incident details</highlight>
      </div>
      <el-form>
        <el-form-item label-width="0px">
          Please provide a description of what happened and any relevant evidence such as transaction ids, announcements, links, screenshots etc.
        </el-form-item>
        <el-form-item label-width="0px">
          <el-input type="textarea" :rows="5" placeholder="Type here..."></el-input>
        </el-form-item>
        <el-form-item label-width="0px">
          
        </el-form-item>
      </el-form>
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
#cover-claim-details{
}
</style>
