<template>
  <div id="claim-assess-accepted">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Stake</highlight>
      </div>
      <div class="secondary-text">
        Your voting power and rewards are proportional to your stake.
      </div>
      <el-row class="content">
        <el-col :span="11">
          <highlight>Total stake:</highlight>
          <highlight class="right-btn mb20">
            <span>{{$etherToNumber(options.staked)}} SOTE</span>
          </highlight>
        </el-col>
        <el-col :span="2" class="divider">
          <el-divider direction="vertical"></el-divider>
        </el-col>
        <el-col :span="11">
          <highlight>Stake period ends:</highlight>
          <highlight class="right-btn mb20">
            <span>{{$secondsToDateString(parseInt(this.options.period))}}</span>
          </highlight>
        </el-col>
      </el-row>
      <div class="right-btn mb20">
        <el-button round type="primary" size="small" @click="increase">Increase stake</el-button>
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
    },
    increase(){
      this.$router.push({ name: this.$RouteNames.CLAIM_DEFAULT, params: { defaultTab: "stake" } });
    }
  }
}
</script>

<style lang="scss" scoped>
#claim-assess-accepted{
  line-height: 35px;
  .secondary-text{
    line-height: 35px;
  }
  .right-btn{
    float: right;
  }
  .divider{
    text-align: center;
  }
  .content {
    color: #606266;
  }
}
</style>
