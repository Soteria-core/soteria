<template>
  <div id="cover-overall">
    <el-card class="box-card">
      <el-form>
        <el-row>
          <h2 class="main-text">Soteria Cover</h2>
          <el-row type="flex" style="flex-wrap: wrap;" justify="space-between" align="middle">
            <el-col class="normal-text" :xs="24" :sm="24" :md="8" :class="{'mb16': device === 'mobile'}" style="line-height: 24px">
              Buy and manage your covers.
            </el-col>
            <div class="right-area">
              <el-button type="primary" plain round @click="howItWorks">How it works</el-button>
              <el-button type="primary" round @click="buyCover">Buy Cover</el-button>
            </div>
          </el-row>
          <el-divider></el-divider>
        </el-row>
        <div class="overall">
          <el-row>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">ACTIVE BNB COVER AMOUNT</div>
              <div class="highlight">{{ bnbCoverAmount }} BNB</div>
            </el-col>
            <el-col :xs="24" :sm="8" class="mb20">
              <div class="secondary-text mb8">TOTAL COVERS SOLD</div>
              <div class="highlight">{{ totalCoversSold }}</div>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {contracts} from '@/settings.js'
import {watch} from '@/utils/watch.js';
import {mapGetters} from 'vuex';
import QuotationDataContract from "@/services/QuotationData";

export default {
  name: "Overall",
  components: {},
  data() {
    return {
      bnbCoverAmount: "-",
      totalCoversSold: "-",
    }
  },
  computed: {
    ...mapGetters([
      'device',
      'web3',
      'member',
      'web3Status',
    ]),
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account) => {
      this.initData();
    });
  },
  methods: {
    initData() {
      if (this.web3Status === this.WEB3_STATUS.AVAILABLE) {
        this.initContract();
      }
    },
    async initContract() {
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.getTotalSumAssured("BNB");
      this.getCoverLength();
    },
    buyCover() {
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
    howItWorks() {
      // 查看pdf
      window.open('pdf/SmartContractCoverWording.pdf');
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
