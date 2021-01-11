<template>
  <el-card id="cover-buyCover-summary">
    <div slot="header" class="clearfix">
      <span>Summary</span>
    </div>
    <div>
      <el-form label-width="120px">
        <div style="line-height: 40px;" class="title">
          <img :src="options.curContract.icon" class="project-large-icon" />
          <span>{{options.curContract.name}}</span>
        </div>
        <el-form-item label="Address:">
          {{options.curContract.address}}
        </el-form-item>
        <el-form-item label="Yearly cost %:">
          {{options.curContract.yearlyCost}}
        </el-form-item>
        <el-form-item label="Capacity BNB:" style="margin-bottom: 20px;">
          {{options.curContract.capacityBNB}}
        </el-form-item>
        <div style="text-align: center;">
          <el-button type="primary" plain round size="small" @click="back" >Back</el-button>
          <el-button type="primary" round size="small" @click="getQuote" >Get quote</el-button>
        </div>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

export default {
  name:"contractSummary",
  components:{

  },
  data() {
    return {
    }
  },
  props: ["options"],
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
    back(){
      this.options.active--;
      this.$emit("back");
    },
    getQuote(){
      this.$emit("getQuote");
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.tips{
  line-height: 40px;
}

.icon-name {
  width: 40px;
  height: 40px;
  vertical-align: middle;
  margin-right: 20px;
}
.title{
  vertical-align: middle;
  font-size: 16px;
  font-weight: bold;
}
</style>
<style lang="scss">
#cover-buyCover-summary{
  .el-form-item {
    margin-bottom: 0px;
    .el-input{
      width:246px;
    }
    .el-form-item__content {
      word-break: break-all;
    }
  }
}
</style>
