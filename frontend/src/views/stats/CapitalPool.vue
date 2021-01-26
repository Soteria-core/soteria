<template>
  <div id="stats-capital-pool" class="app-container">
    <el-divider content-position="left">
      <h4>Capital Pool</h4>
    </el-divider>
    <el-form label-width="200px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Capital Pool Size">
            <highlight>
              <span v-format="'#,##0.00'">{{$etherToNumber(cps)}}</span> BNB /
              $<span v-format="'#,##0.00'">{{cpsUSD}}</span>
            </highlight>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MCR%">
            <highlight>{{mcrPercentage}}%</highlight>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Minimum Capital Requirement">
            <highlight>
              <span v-format="'#,##0.00'">{{$etherToNumber(mcr)}}</span> BNB /
              $<span v-format="'#,##0.00'">{{mcrUSD}}</span>
            </highlight>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Active Cover Amount to Capital Pool Size Ratio">
            <highlight>
              <span v-format="'#,##0.00'">{{ratio}}%</span>
            </highlight>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import MCRContract from "@/services/MCR";
import PoolDataContract from "@/services/PoolData";
import { BigNumber } from "bignumber.js";

export default {
  components: { },
  props: ["options"],
  data() {
    return {
      MCR: null,
      PoolData: null,
      cps: 0,
      mcrPercent: 0,
      mcr: 0,
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member']),
    mcrPercentage(){
      return BigNumber(this.mcrPercent).div(100).toFixed(2);
    },
    cpsUSD(){
      return BigNumber(this.$etherToValue(this.cps)).times(this.member.bnbQuote).toFixed(2, 1);
    },
    mcrUSD(){
      return BigNumber(this.$etherToValue(this.mcr)).times(this.member.bnbQuote).toFixed(2, 1);
    },
    ratio(){
      return BigNumber(this.options.totalCoverAmount).div(this.$etherToValue(this.cps)).times(100).toFixed(2);
    }
  },
  watch: {
    web3Status: watch.web3Status
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, ()=>{
      this.initData();
    });
  },
  methods: {
    initData() {
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.MCR = await this.getContract(MCRContract);
      this.PoolData = await this.getContract(PoolDataContract);
      this.getCapitalPoolSize();
      this.getLastMCR();
    },
    getCapitalPoolSize(){
      const instance = this.MCR.getContract().instance;
      instance.calVtpAndMCRtp().then(res => {
        console.info(res, res.toString());
        this.cps = res[0].toString();
      });
    },
    getLastMCR(){
      const instance = this.PoolData.getContract().instance;
      instance.getLastMCR().then(res => {
        console.info(res, res.toString());
        this.mcrPercent = res[0].toString();
        this.mcr = res[2].toString();
      });
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
