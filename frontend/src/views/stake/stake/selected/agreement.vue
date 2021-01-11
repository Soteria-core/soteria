<template>
  <div id="stake-stake-selected-agreement" class="secondary-text">
    <el-checkbox-group v-model="options.terms">
      <el-checkbox label="risk">I agree to the lock up period and risks.</el-checkbox>
      <el-checkbox label="max">I understand the maximum I could lose is {{options.maxTotalAmount}} SOTE.</el-checkbox>
    </el-checkbox-group>
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
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
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
#stake-stake-selected-agreement{
  line-height: 35px;
  word-break:break-all;
  .el-checkbox__label {
    text-overflow: ellipsis;
    white-space: normal;
    vertical-align: middle;
    display: inline-block;
  }
}
</style>
<style lang="scss">
@import '@/styles/element-variables.scss';
#stake-stake-selected-agreement{
  .el-checkbox__label {
    text-overflow: ellipsis;
    white-space: normal;
    vertical-align: middle;
    display: inline-block;
  }
}
</style>