<template>
  <div id="cover-claim-cover">
    <el-card :style="{top: top+'px'}">
      <div slot="header" class="clearfix">
        <highlight>{{titles[options.active]}}</highlight>
      </div>
      <div style="margin-bottom: 20px;" v-if="options.active!=2">
        <div style="line-height: 40px;" class="title">
          <img :src="options.cover.contract.icon" class="project-large-icon" />
          <span>{{options.cover.contract.name}}</span>
        </div>
        <el-form label-width="120px">
          <el-form-item label="Purchase:">
            {{this.$secondsToDateString(options.cover.purchase)}}
          </el-form-item>
          <el-form-item label="Expiry:">
            {{this.$secondsToDateString(options.cover.validUntil)}}
          </el-form-item>
          <el-form-item label="Amount:">
            {{options.cover.sumAssured}} BNB
          </el-form-item>
          <el-form-item label="Cover ID:">
            {{options.cover.cid}}
          </el-form-item>
        </el-form>
      </div>
      <div style="margin-bottom: 20px;" v-else>
        <LiBorderRadius class="account">
          {{formatterLongString(options.account, 20, 5, 5)}}
          <span v-if="options.verified">Verified</span>
        </LiBorderRadius>
      </div>
      <div style="text-align: center;">
        <el-button type="primary" plain round size="small" @click="back" >Back</el-button>
        <el-button type="primary" :disabled="!isContinue" round size="small" @click="next" >{{buttonText[options.active]}}</el-button>
      </div>
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
      // titles: ["Summary", "Summary", "Addresses", "Summary"],
      // buttonText: ["Continue", "Continue", "Submit proof", "Submit claim"],
      titles: ["Summary", "Summary"],
      buttonText: ["Submit claim"],
      top: 0,
      isContinue: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
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
      this.isContinue = this.checkContinue();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    next(){
      this.$emit("next");
    },
    back(){
      this.$emit("back");
    },
    checkContinue(){

      return true;
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
#cover-claim-cover{
  .el-card{
    position: relative;
  }
  .el-form-item{
    margin-bottom: 0px;
  }
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
    font-size: 36px !important;
  }
  .account{
    background-color: #FEABA9;
    color: #FFFFFF !important;
    float: right;
    line-height: 14px;
  }
  .title{
    vertical-align: middle;
    font-size: 14px;
    font-weight: bold;
  }
}
</style>
