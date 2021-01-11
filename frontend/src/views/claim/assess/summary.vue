<template>
  <div id="claim-assess-summary">
    <el-card :style="{top: top+'px'}">
      <div slot="header" class="clearfix">
        <highlight>Summary</highlight>
        <LiBorderRadius class="balance">
          Claim {{options.claim.claimId}}
        </LiBorderRadius>
      </div>
      <div style="margin-bottom: 20px;">
        <div style="line-height: 40px;" class="title">
          <img :src="options.claim.contract.icon" class="project-large-icon" />
          <span>{{options.claim.contract.name}}</span>
        </div>
        <el-form label-width="120px">
          <el-form-item label="Purchase:">
            {{this.$secondsToDateString(options.claim.cover.purchase)}}
          </el-form-item>
          <el-form-item label="Expiry:">
            {{this.$secondsToDateString(options.claim.cover.validUntil)}}
          </el-form-item>
          <el-form-item label="Amount:">
            {{options.claim.cover.sumAssured}} BNB
          </el-form-item>
          <el-form-item v-if="options.active>0" label="Your verdict:">
            <el-tag v-if="isAccept" type="success">Accept</el-tag>
            <el-tag v-else type="dange">Deny</el-tag>
          </el-form-item>
        </el-form>
      </div>
      <div style="text-align: center;">
        <el-button type="primary" plain round size="small" @click="back" >Back</el-button>
        <el-button v-if="options.active<1" type="primary" :disabled="isContinue" round size="small" @click="next" >Continue</el-button>
        <el-button v-else-if="isAccept" type="primary" :disabled="isContinue" round size="small" @click="next" >Accept claim</el-button>
        <el-button v-else type="primary" :disabled="isContinue" round size="small" @click="next" >Deny claim</el-button>
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
      top: 0,
      criteria: {
        incident: "yes",
        bebore: "no",
        loss: "yes",
        unintended: "yes",
        hacks: "no",
        exteranal: "no"
      }
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    isAccept(){
      const criteria = this.options.criteria;
      let criFlag = true;
      for(let p in criteria){
        if(this.criteria[p] != criteria[p]){
          criFlag = false;
          break;
        }
      }
      return criFlag;
    },
    isContinue(){
      if(this.options.claim.assessType == "CA" && BigNumber(this.options.staked).eq(0)){
        return true;
      }
      return false;
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
    next(){
      if(this.checkContinue()){
        if(this.options.active<1){
          this.$emit("next");
        }else if(this.isAccept){
          this.$emit("accept");
        }else{
          this.$emit("deny");
        }
      }
    },
    back(){
      this.$emit("back");
    },
    checkContinue(){
      const options = this.options;
      if(options.active == 0){
        if(!options.criteria.incident || !options.criteria.bebore || !options.criteria.loss
            || !options.criteria.unintended || !options.criteria.hacks ||!options.criteria.exteranal){
          this.$message.error("Please chioce yes or no");
          return false;
        }
      }

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
#claim-assess-summary{
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
  .balance {
    background-color: #FEABA9;
    color: #FFFFFF !important;
    float: right;
    line-height: 12px;
  }
}
</style>
