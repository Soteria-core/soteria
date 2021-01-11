<template>
  <div id="stake-unstake-summary" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card :style="{top: top+'px'}">
      <h3 class="main-text">Summary</h3>
      <div style="margin-bottom: 20px;">
        <el-form label-width="120px" label-position="left">
          <div>
            <highlight>Before</highlight>
          </div>
          <el-form-item label="Pending:">
            {{$toFixed(unstaked)}} SOTE
          </el-form-item>
          <div>
            <highlight>After</highlight>
          </div>
          <el-form-item label="Pending:">
            {{$toFixed(allUnstake)}} SOTE
          </el-form-item>
        </el-form>
      </div>
      <div class="error" v-if="error" style="margin-bottom: 10px;text-align: center;">
        <svg-icon icon-class="circle" class="icon-name error-color"></svg-icon>
        {{error}}<br/>
      </div>
      <div style="text-align: center;">
        <el-button type="primary" plain round size="small" @click="viewHistory" >View history</el-button>
        <el-button type="primary" :disabled="!isContinue" round size="small" @click="confirm" >Confirm</el-button>
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
      error: null,
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
      return this.options.stakedProjects.map(item => item.unstaked).reduce((total, item) => BigNumber(total?total:0).plus(item?item:0)).toString();
    },
    unstaking(){
      return this.options.stakedProjects.map(item => item.unstaking).reduce((total, item) => BigNumber(total?total:0).plus(item?item:0)).toString();
    },
    allUnstake(){
      return BigNumber(this.unstaked).plus(this.unstaking).toString();
    },
  },
  watch: {
    web3Status: watch.web3Status,
    options: {
      handler(newVal, oldVal){
        this.isContinue = this.checkContinue();
      },
      deep: true,
    },
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
      this.isContinue = this.checkContinue();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    confirm(){
      const vBN = BigNumber(this.unstaking);
      if(vBN.lte(0)){
        this.$message.error(`Unstake ${0} SOTE minimum all projects.`);
        return;
      }
      this.$emit("confirm");
    },
    checkContinue(){
      this.error = null;
      const vBN = BigNumber(this.unstaking);
      if(vBN.lte(0)){
        return false;
      }
      
      const errRemaining = this.options.stakedProjects.filter(item => {
        const remainingStaked = BigNumber(item.ownerStaked).minus(item.unstaking).minus(item.unstaked);
        return remainingStaked.lt(0);
      }).length;
      if(errRemaining > 0){
        this.error = `The unstake cannot greater than the stake.`;
        return false;
      }

      const errCount = this.options.stakedProjects.filter(item => {
        const remainingStaked = BigNumber(item.ownerStaked).minus(item.unstaking).minus(item.unstaked);
        return remainingStaked.gt(0) && remainingStaked.lt(this.settings.stake.minAmountPerContract);
      }).length;
      if(errCount > 0){
        this.error = `Remaining stake ${this.settings.stake.minAmountPerContract} SOTE minumum per project.`;
        return false;
      }
      
      const perError = this.options.stakedProjects.filter(item => {
        const unstake = BigNumber(item.unstaking);
        return unstake.gt(0) && unstake.lt(this.settings.stake.minAmountPerContract);
      }).length;
      if(perError > 0){
        this.error = `Unstake ${this.settings.stake.minAmountPerContract} SOTE minumum per project.`;
        return false;
      }
      return true;
    },
    viewHistory(){
      this.$router.push({name: "UnstakeHistory", params: JSON.parse(JSON.stringify(this.options))});
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
#stake-unstake-summary{
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
