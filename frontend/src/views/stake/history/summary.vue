<template>
  <div id="stake-withdraw-summary" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card :style="{top: top+'px'}">
      <h3 class="main-text">Summary</h3>
      <div style="margin-bottom: 20px;">
        <el-form label-width="120px" label-position="left">
          <el-form-item label="Pending:">
            {{$toFixed(unstaked)}} SOTE
          </el-form-item>
          <el-form-item label="Available:">
            {{$toFixed(available)}} SOTE
          </el-form-item>
          <el-form-item label="Contracts:">
            {{options.stakedProjects.length}}
          </el-form-item>
        </el-form>
      </div>
      <div style="text-align: center;">
        <el-button type="primary" plain round size="small" @click="back" >Back</el-button>
        <el-button type="primary" round size="small" @click="unstake" >Unstake</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
      top: 0,
      isContinue: false,
      loading: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    unstaked(){
      const unstakedMap = this.options.stakedProjects.map(item => item.unstaked);
      if(unstakedMap.length == 0){
        return 0;
      }
      return unstakedMap.reduce((total, item) => BigNumber(total?total:0).plus(item?item:0)).toString();
    },
    available(){
      const availabledMap = this.options.stakedProjects.map(item => {
        return BigNumber(item.ownerStaked).minus(item.unstaked ? item.unstaked : 0)
      });
      if(availabledMap.length == 0){
        return 0;
      }
      return availabledMap.reduce((total, item) => BigNumber(total?total:0).plus(item?item:0)).toString();
    }
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
    window.addEventListener('scroll', this.moveSelected, false)
  },
  destroyed(){
    window.removeEventListener('scroll', this.moveSelected, false);
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    back(){
      this.$router.push("/system/stake/default");
    },
    unstake(){
      this.$router.push({name: "Unstake", params: JSON.parse(JSON.stringify(this.options))});
    },
    moveSelected(e){
      // 根据滚动条移动组件位置
      const el = this.$parent.$el;
      const elTop = el.getBoundingClientRect().top;
      const top = 69 - elTop;
      if(top<0 && this.top==0){
        return;
      }
      this.top = top < 0 ? 0 : top;
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-withdraw-summary{
  h3{
    margin-top: 0px !important;
  }
  .el-card{
      position: relative;
  }
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
  .el-form-item{
    margin-bottom: 0px;
  }
}
</style>
