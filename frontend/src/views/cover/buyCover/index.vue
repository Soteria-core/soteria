<template>
  <div id="cover-buyCover">
    <!-- <el-page-header @back="goBack" content="Buy Cover">
    </el-page-header> -->
    <el-card class="box-card">
      <el-steps :active="options.active" align-center finish-status="success" process-status="finish">
        <el-step title="Select Contract"></el-step>
        <el-step title="Get Quote"></el-step>
        <el-step title="Confirm"></el-step>
      </el-steps>
    </el-card>
    <br />
    <transition name="el-fade-in-linear" mode="out-in">
      <contractList :options="options" v-if="options.active==0" @selectContract="selectContract"/>
      <quote :options="options" @next="selectContract" @back="options.active--" v-if="options.active==1"/>
      <payment :options="options" @next="selectContract" @back="options.active--" v-if="options.active==2"/>
    </transition>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import contractList from '@/views/cover/buyCover/contractList'
import quote from '@/views/cover/buyCover/quote'
import payment from '@/views/cover/buyCover/payment'

export default {
  components:{
    contractList, quote, payment
  },
  data() {
    return {
      options: {
        active: 0,
        ownerContracts: [],
        curContract: null,
        amount: '',
        currency: "BNB",
        period: '', //周期，天
        quote: null,
        getQuoteTime: null,
        expiresTime: null,
        yearlyCost: '' // 年花费保额百分比
      },
      defaultOptions: {
        active: 0,
        ownerContracts: [],
        curContract: null,
        amount: 0,
        currency: "BNB",
        period: 0, //周期，天
        quote: null,
        getQuoteTime: null,
        expiresTime: null,
      }
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
    goBack(){
      this.$router.push("/system/cover/default");
    },
    selectContract(contract){
      this.options.active++;
    }
  }
}
</script>
<style lang="scss" scoped>
#cover-buyCover{
  .el-page-header{
    margin-bottom: 20px;
  }
}
</style>
<style>
#cover-buyCover .el-page-header .el-page-header__left,
#cover-buyCover .el-page-header .el-page-header__content{
  color: #303133 !important;
  font-size: 14px !important;
}
#cover-buyCover .el-step__title{
  white-space: nowrap;
  font-size: 14px !important;
}
</style>
