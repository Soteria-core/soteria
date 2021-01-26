<template>
  <div id="cover-overall">
    <el-card class="box-card">
      <el-form :disabled="!member.isMember">
        <el-row>
        <h2 class="main-text">Soteria Cover</h2>
        <span class="normal-text">Buy and manage your covers.</span>
        <span class="right-area">
          <el-button type="primary" plain round @click="howItWorks">How it works</el-button>
          <el-button type="primary" round @click="buyCover">Buy Cover</el-button>
        </span>
        <el-divider></el-divider>
        </el-row>
        <div class="overall">
        <el-row class="secondary-text" :gutter="20">
          <el-col :span="8">ACTIVE BNB COVER AMOUNT</el-col>
          <el-col :span="8">TOTAL COVERS SOLD</el-col>
        </el-row>
        <el-row class="highlight" :gutter="20">
          <el-col :span="8">{{ bnbCoverAmount }} BNB</el-col>
          <el-col :span="8">{{ totalCoversSold }}</el-col>
        </el-row>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { contracts } from '@/settings.js'
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import QuotationDataContract from "@/services/QuotationData";

export default {
  name: "Overall",
  components:{
  },
  data() {
    return {
      bnbCoverAmount : "-",
      totalCoversSold : "-",
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
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.getTotalSumAssured("BNB");
      this.getCoverLength();
    },
    buyCover(){
      this.$router.push("/system/cover/buy");
    },
    getTotalSumAssured(token) {
      const contract = this.QuotationData.getContract();
      const charCode = [];
      for (let i = 0; i < 4; i++) {
        charCode.push(i < token.length ? token.charCodeAt(i) : 0);
      }
      contract.instance.getTotalSumAssured(charCode).then(response => {
        this[token.toLowerCase() + "CoverAmount"] = response.toString();
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
      });
    },
    getCoverLength() {
      const contract = this.QuotationData.getContract();
      contract.instance.getCoverLength().then(response => {
        this.totalCoversSold = parseInt(response.toString()) - 1;
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
      });
    },
    howItWorks(){
      // 查看pdf
      window.open('pdf/SmartContractCoverWording.pdf');
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-overall{
  .overall {
    .el-row {
      margin-bottom: 20px !important;
    }
  }
}
</style>
