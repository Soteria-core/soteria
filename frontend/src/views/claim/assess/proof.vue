<template>
  <div id="claim-assess-proof">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Affected addresses</highlight>
      </div>
      <el-row :gutter="20">
        <el-col :span="12" class="secondary-text addresses">
          <highlight>Inspect the transactions</highlight>
          of the <highlight>affected addresses</highlight>
          submitted as proof of loss and
          <highlight>answer the questions below.</highlight>
          You can consult with other members by joining
          <el-button type="text">#claims-discussions</el-button>
          on Discord.
        </el-col>
        <el-col :span="12">
          <el-button type="text">{{member.account}}</el-button>
        </el-col>
      </el-row>
    </el-card>
    <br/>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Assess loss</highlight>
      </div>
      <div class="card-body">
        <el-form v-model="options.proof" :rules="rules">
          <div class="secondary-text">Has the user submitted evidence of the loss they incurred?</div>
          <el-form-item prop="evidence">
            <el-radio-group v-model="options.proof.evidence">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="secondary-text">Was there material loss to the cover owner of at least 20% of the cover amount?</div>
          <el-form-item prop="loss">
            <el-radio-group v-model="options.proof.loss">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
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
      rules:{
        evidence: [
          { required: true, trigger: 'blur', message: 'Please choice yes or no' },
        ],
        loss: [
          { required: true, trigger: 'blur', message: 'Please choice yes or no' },
        ],
      },
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
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      if(!this.member.isMember){
        this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT });
      }
    },

  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-assess-proof{
  .addresses{
    line-height: 40px;
  }
  .card-body{
    line-height: 35px;
  }
}
</style>
