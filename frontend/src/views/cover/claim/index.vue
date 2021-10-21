<template>
  <div
    id="cover-claim"
    v-loading.fullscreen.lock="loading"
    element-loading-text="Claim submitting...">
    <el-card class="box-card">
      <div slot="header" class="title">Open claim</div>
      <el-steps :active="options.active" align-center finish-status="success" process-status="finish">
        <!-- <el-step title="Incident details"></el-step> -->
        <!-- <el-step title="Affected addresses"></el-step>
        <el-step title="Submit proof"></el-step> -->
        <el-step title="Submit claim"></el-step>
      </el-steps>
    </el-card>
    <br />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="18">
        <transition name="el-fade-in-linear" mode="out-in">
          <!-- <coverDetails :options="options" v-if="options.active==0"/> -->
          <!-- <addresses :options="options"  v-if="options.active==1"/>
          <proof :options="options" v-if="options.active==2"/> -->
          <claim :options="options" v-if="options.active==0"/>
        </transition>
      </el-col>
      <el-col :xs="24" :sm="24" :md="6">
        <cover class="right-top" :options="options" @next="next" @back="back"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import claim from './claim'
import cover from './cover'
import { ROUTE_NAMES } from '@/utils/Constants.js'
import ClaimsContract from '@/services/Claims'
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    claim, cover
  },
  data() {
    return {
      options: {
        active: 0,

      },
      defaultOptions: {
        active: 0,

      },
      Claims: null,
      loading: false,
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
    web3Status: watch.web3Status
  },
  created(){

    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  beforeRouteEnter(to, from, next) {
    if(to.params && to.params.cid){
      next();
    }else{
      next({ name: ROUTE_NAMES.COVER_DEFAULT });
    }
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
        this.initCoveData();
      }
    },
    initCoveData(){
      this.options.cover = JSON.parse(JSON.stringify(this.$route.params));
      this.options.remainingClaims = BigNumber(this.options.cover.status).eq(0) ? 2 : 1;
      if(this.options.cover.memberAddress.toLowerCase() != this.member.account.toLowerCase()){
        console.warn("The account is not match, redirect to cover default page.");
        this.$router.push({ name: this.$RouteNames.COVER_DEFAULT });
      }
    },
    async initContract(){
      if(!this.member.isMember){
        this.$router.push({ name: this.$RouteNames.COVER_DEFAULT });
      }
      this.Claims = await this.getContract(ClaimsContract);
    },
    back(){
      if(this.options.active == 0){
        this.$router.push({ name: this.$RouteNames.COVER_DEFAULT });
      }else{
        this.options.active --;
      }
    },
    next(contract){
      if(this.options.active<0){
        this.options.active++;
      }else{
        // 提交索赔
        this.loading = true;
        const contract = this.Claims.getContract();
        contract.instance.submitClaim(this.options.cover.cid.toString(), { from: this.member.account }).then(res => {
          console.info(res, res.toString());
          this.loading = false;
          this.$router.push({ name: this.$RouteNames.COVER_DEFAULT });
        }).catch(e => {
          console.error(e);
          this.$message.error(e.message);
          this.loading = false;
        });
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-claim{
  .title{
    vertical-align: middle;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
