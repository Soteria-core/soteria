<template>
  <div id="claim-assess-criteria">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Assess general criteria</highlight>
      </div>
      <div class="card-body">
        <el-form v-model="options.criteria" :rules="rules">
          <div class="secondary-text">Did an incident occur during the period the cover was active?</div>
          <el-form-item prop="incident">
            <el-radio-group v-model="options.criteria.incident">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="secondary-text">Was the bug publicly disclosed before the cover period began?</div>
          <el-form-item prop="bebore">
            <el-radio-group v-model="options.criteria.bebore">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="secondary-text">Was there a total material loss of at least 20% of the cover amount due to the incident?</div>
          <el-form-item prop="loss">
            <el-radio-group v-model="options.criteria.loss">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="secondary-text">Was the incident a direct result of the smart contract code being used in an unintended way?</div>
          <el-form-item prop="unintended">
            <el-radio-group v-model="options.criteria.unintended">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="secondary-text">Did the loss of funds occur due to phishing, private key security breaches, malware, exchange hacks or any other activity where the covered smart contract continud to act as intended?</div>
          <el-form-item prop="hacks">
            <el-radio-group v-model="options.criteria.hacks">
              <el-radio label="yes">Yes</el-radio>
              <el-radio label="no">No</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="secondary-text">
            Did the incident occur due to inputs exteranal to the smart contract system, that behaved in an unintended ways,
            but the smart contract system? continued to operate as intended?
            (Where inputs include but are not limited to : oracles, governance systems, incentive structures,
            miner behaviour and network congestion.)
          </div>
          <el-form-item prop="exteranal">
            <el-radio-group v-model="options.criteria.exteranal">
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
import criteria from './criteria'
import submit from './submit'
import proof from './proof'
import summary from './summary'
import { ROUTE_NAMES } from '@/utils/Constants.js'
import ClaimsContract from '@/services/Claims'

export default {
  components:{
    criteria, proof, submit, summary
  },
  props: ["options"],
  data() {
    return {
      rules:{
        incident: [
          { required: true, trigger: 'blur', message: 'Please choice yes or no' },
        ],
        bebore: [
          { required: true, trigger: 'blur', message: 'Please choice yes or no' },
        ],
        unintended: [
          { required: true, trigger: 'blur', message: 'Please choice yes or no' },
        ],
        hacks: [
          { required: true, trigger: 'blur', message: 'Please choice yes or no' },
        ],
        exteranal: [
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
#claim-assess-criteria{
  .card-body{
    line-height: 35px;
  }
  .addresses{
    line-height: 40px;
  }
}
</style>
