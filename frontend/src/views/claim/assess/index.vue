<template>
  <div id="claim-assess" v-loading.fullscreen.lock="loading"
    element-loading-text="Claim submitting...">
    <become :options="options" />
    <el-card class="box-card">
      <div slot="header" class="title">Assess claim</div>
      <el-steps :active="options.active" align-center finish-status="success" process-status="finish">
        <el-step title="General criteria"></el-step>
        <!-- <el-step title="Proof of loss"></el-step> -->
        <el-step title="Submit assessment"></el-step>
      </el-steps>
    </el-card>
    <br />
    <el-row :gutter="20">
      <el-col :span="18">
        <transition name="el-fade-in-linear" mode="out-in">
          <criteria :options="options" v-if="options.active==0"/>
          <!-- <proof :options="options" v-if="options.active==1"/> -->
          <submit :options="options" v-if="options.active==1"/>
        </transition>
      </el-col>
      <el-col :span="6">
        <claimSummary class="right-top" :options="options" @next="next" @back="back" @accept="accept" @deny="deny"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import become from './becomeAssessor'
import criteria from './criteria'
import submit from './submit'
import proof from './proof'
import claimSummary from './summary'
import { ROUTE_NAMES } from '@/utils/Constants.js'
import ClaimsContract from '@/services/Claims'

export default {
  components:{
    criteria, proof, submit, claimSummary, become
  },
  data() {
    return {
      options: {
        active: 0,
        staked: null,
        criteria: {
          incident: null,
          bebore: null,
          unintended: null,
          hacks: null,
          exteranal: null
        },
        proof: {
          evidence: null,
          loss: null,
        }
      },
      defaultOptions: {
        active: 0,
        staked: null,
        criteria: {
          incident: null,
          bebore: null,
          unintended: null,
          hacks: null,
          exteranal: null
        },
        proof: {
          evidence: null,
          loss: null,
        }
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
    if(to.params && to.params.claimId){
      next();
    }else{
      next({ name: ROUTE_NAMES.CLAIM_DEFAULT });
    }
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
        this.initClaimData();
      }
    },
    initClaimData(){
      this.options.claim = JSON.parse(JSON.stringify(this.$route.params));
      console.info(this.options.claim);
    },
    async initContract(){
      if(!this.member.isMember){
        this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT });
      }
      this.Claims = await this.getContract(ClaimsContract);
    },
    back(){
      if(this.options.active == 0){
        this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT });
      }else{
        this.options.active --;
      }
    },
    next(contract){
      if(this.options.active<1){
        this.options.active++;
      }
    },
    accept(){
      this.submit(1);
    },
    deny(){
      this.submit(-1);
    },
    submit(param){
      // 提交投票
      this.loading = true;
      const contract = this.Claims.getContract();
      const claimId = this.options.claim.claimId.toString();
      const verdict = param.toString();
      console.info("投票：", claimId, verdict, this.options.claim.assessType);
      if(this.options.claim.assessType == "CA"){
        contract.instance.submitCAVote(claimId, verdict, { from: this.member.account }).then(res => {
          console.info(res, res.toString());
          this.loading = false;
          this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT });
        }).catch(e => {
          console.error(e);
          this.$message.error(e.message);
          this.loading = false;
        });
      }else{
        contract.instance.submitMemberVote(claimId, verdict, { from: this.member.account }).then(res => {
          console.info(res, res.toString());
          this.loading = false;
          this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT });
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
#claim-assess{
  .title{
    vertical-align: middle;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
