<template>
  <el-table
    id="cover-default-active"
    :data="activeCovers"
    stripe
    v-loading.fullscreen.lock="false"
    element-loading-text="Cover loading ..."
    style="width: 100%">
    <el-table-column
      prop="contract"
      label="PROJECT">
      <template slot-scope="scope">
        <div v-if="scope.row.contract">
          <img :src="scope.row.contract.icon" class="project-list-icon" />
          <span>{{scope.row.contract.name}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="cid" width="100"
      label="ID">
    </el-table-column>
    <el-table-column
      prop="sumAssured" width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.sumAssured}} BNB
      </template>
    </el-table-column>
    <el-table-column width="240"
      label="PREMIUM">
      <template slot-scope="scope">
        {{$etherToNumber(scope.row.premiumNXM)}} SOTE
      </template>
    </el-table-column>
    <el-table-column
      prop="coverPeriod" width="200"
      label="PERIOD">
      <template slot-scope="scope">
        {{formatPeriod(scope.row)}}
      </template>
    </el-table-column>
    <el-table-column
      prop="status" width="150"
      label="STATUS">
      <template slot-scope="scope">
        <el-tag :type="coverStatusColors[scope.row.status]" :class="{ 'el-tag-blue': coverStatusColors[scope.row.status]=='' }">
          {{coverStatus[parseInt(scope.row.status)]}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column width="100"
      label="ACTIONS">
      <template slot-scope="scope">
        <el-link type="primary" :disabled="scope.row.cannotClaim" :underline="false" @click="claim(scope.row)">Claim</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import QuotationDataContract from '@/services/QuotationData';
import TokenFunctionsContract from '@/services/TokenFunctions';
import Moment from 'moment';
import { getCoverContracts, loadCover } from '@/api/cover.js';
import { BigNumber } from 'bignumber.js';

export default {
  name: "ActiveCovers",
  components:{
  },
  props: ["options"],
  data() {
    return {
      loading: false,
      activeCovers: [],
      QuotationData: null,
      TokenFunctions: null,
      coverStatus: [ "Active", "Claim Accepted", "Claim Denied", "Cover Expired", "Claim Submitted", "Requested" ],
      coverStatusColors: [ "", "success", "danger", "warning", "", "" ],
      key: "member_cover_",
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
    "member.isMember": {
      handler(newVal){
        if(newVal){
          this.initData();
        }
      }
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
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.TokenFunctions = await this.getContract(TokenFunctionsContract);
      this.getActiveCovers();
    },
    async getActiveCovers(){
      try{
        if(!this.member.isMember){
          return;
        }
        this.activeCovers.splice(0, this.activeCovers.length);
        const instance = this.QuotationData.getContract().instance;
        const ids = await instance.getAllCoversOfUser(this.member.account);
        const response = await getCoverContracts(this);
        const contracts = response.data;

        for(let i=ids.length - 1; i>=0; i--){
          try{
            let cover = await loadCover(this, ids[i], true, contracts);
            cover.cannotClaim = await this.cannotClaim(cover);
            this.activeCovers.push(cover);
          }catch(e){
            console.error(e);
          }
        }
      }catch(e){
        this.loading = false;
        this.$message.error(e.message);
      }finally{
        this.loading = false;
      }
    },
    formatPeriod(row){
      if(row.validUntil){
        return this.$secondsToDateString(row.purchase) + " - " + this.$secondsToDateString(row.validUntil);
      }
      return "-";
    },
    formatStatus(row){

    },
    async cannotClaim(row){
      if(row.status == 0){
        return false;
      }
      let cannotClaimStatus = (row.status==1 ||row.status==3 || row.status==4 || row.status==5);
      if(cannotClaimStatus){
        return cannotClaimStatus;
      }

      cannotClaimStatus = row.status==2 && this.options.claims.filter(item => BigNumber(item.coverId).eq(row.cid)).length>=2;
      if(cannotClaimStatus){
        return cannotClaimStatus;
      }
      const instance = this.TokenFunctions.getContract().instance;
      cannotClaimStatus = await instance.getLockedCNAgainstCover(row.cid.toString());
      return BigNumber(cannotClaimStatus).eq(0);
    },
    claim(row){
      this.$router.push({ name: this.$RouteNames.COVER_CLAIM, params: JSON.parse(JSON.stringify(row)) });
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-default-active{
  .icon-name{
    vertical-align: middle;
    margin-right: 10px;
  }
  .el-tag-blue{
    background-color: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
  }
}
</style>
