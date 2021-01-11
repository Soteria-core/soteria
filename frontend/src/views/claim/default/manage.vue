<template>
  <div id="claim-default-manage">
    <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Claims" name="claims">
        <claims v-if="activeName=='claims'" @assess="assess"/>
      </el-tab-pane>
      <el-tab-pane label="Assessments" name="assessments" :disabled="!member.isMember">
        <assessments v-if="activeName=='assessments'" />
      </el-tab-pane>
      <el-tab-pane label="Stake" name="stake" :disabled="!member.isMember">
        <stake v-if="activeName=='stake'"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import claims from './claims';
import assessments from './assessments.vue';
import stake from './stake/index';
import { BigNumber } from 'bignumber.js';

export default {
  name: "ClaimDefaultManage",
  components:{
    claims, stake, assessments
  },
  props: ["defaultTab"],
  data() {
    return {
      activeName: "claims"
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
    defaultTab: {
      handler(newVal){
        if(newVal){
          this.activeName = newVal;
        }
      },
      immediate: true
    }
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
    handleClick(){

    },
    assess(row){
      const params = JSON.parse(JSON.stringify(row));
      params.assessType = BigNumber(row.status).eq(0) ? "CA" : "MV";
      this.$router.push({ name: this.$RouteNames.CLAIM_ASSESS, params: params });
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-manage{

}
</style>
