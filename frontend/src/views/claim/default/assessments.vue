<template>
  <el-table
    id="claim-default-assess"
    :data="claims"
    stripe
    v-loading.fullscreen.lock="false"
    element-loading-text="Claims loading ..."
    v-el-table-infinite-scroll="load"
    height="calc(100vh - 300px)"
    style="width: 100%">
    <el-table-column
      prop="claimId"
      width="100"
      label="ID">
    </el-table-column>
    <el-table-column
      prop="contract"
      min-width="160"
      label="PROJECT">
      <template slot-scope="scope">
        <div v-if="scope.row.contract">
          <img :src="scope.row.contract.icon" class="project-list-icon" />
          <span>{{scope.row.contract.name}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="cover.sumAssured"
      min-width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.cover.sumAssured}} BNB
      </template>
    </el-table-column>
    <el-table-column
      prop="assessed"
      min-width="200"
      label="ASSESSED AS">
      <template slot-scope="scope">
        <span v-if="scope.row.type=='CA'">Claims assessor</span>
        <span v-else>Claims member</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="vote.verdict"
      min-width="150"
      label="YOUR VERDICT">
      <template slot-scope="scope">
        <el-tag :type="verdictsColors[scope.row.vote.verdict]">
          {{verdicts[scope.row.vote.verdict]}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="finalVerdict"
      min-width="150"
      label="FINAL VERDICT">
      <template slot-scope="scope">
        <el-tag :type="verdictsColors[scope.row.finalVerdict]">
          {{verdicts[scope.row.finalVerdict]}}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import Moment from 'moment';
import { getCoverContracts, loadCover } from '@/api/cover.js';
import { BigNumber } from 'bignumber.js';
import AssessmentsService from './assessmentsService.js';


export default {
  name: "claims",
  components:{
  },
  data() {
    return {
      loading: false,
      claimIds: [],
      claims: [],
      contracts: [],
      Claims: null,
      ClaimsData: null,
      QuotationData: null,
      AssessmentsServiceCA: null,
      AssessmentsServiceMV: null,
      verdicts: {
        "-1": "Denied",
        "0": "Pending",
        "1": "Accepted",
      },
      verdictsColors: {
        "-1": "dange",
        "0": "warning",
        "1": "success",
      },
      key: "assess_",
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
    async initData(){
      console.info("created.............");
      console.info(AssessmentsService);
      await this.initContracts();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.initClaims();
    },
    async initContracts(){
      if(this.contracts && this.contracts.length>0){
        return;
      }
      const response = await getCoverContracts(this);
      this.contracts = response.data;
    },
    initClaims(){
      this.claims.splice(0, this.claims.length);

      console.info("加载数据...............");
      this.AssessmentsServiceCA = new AssessmentsService(this, this.claims, "CA", this.contracts);
      this.AssessmentsServiceMV = new AssessmentsService(this, this.claims, "MV", this.contracts);
    },
    load(){
      if(this.AssessmentsServiceCA){
        this.AssessmentsServiceCA.loadData();
      }
      if(this.AssessmentsServiceMV){
        this.AssessmentsServiceMV.loadData();
      }
    },
    formatPeriod(row){
      if(row.cover && row.cover.validUntil){
        return this.$secondsToDateString(row.cover.purchase) + " - " + this.$secondsToDateString(row.cover.validUntil);
      }
      return "-";
    },
    formatStatus(row){

    },
    assess(row){
      this.$emit("assess", row);
      //this.$router.push({ name: this.$RouteNames.COVER_CLAIM, params: JSON.parse(JSON.stringify(row)) });
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-assess{
  .icon-name{
    vertical-align: middle;
    margin-right: 10px;
  }
  .el-tag-primary{
    background-color: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
  }
}
</style>
