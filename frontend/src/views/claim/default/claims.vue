<template>
  <el-table
    id="claim-default-open"
    :data="claims"
    stripe
    v-loading.fullscreen.lock="false"
    element-loading-text="Claims loading ..."
    v-el-table-infinite-scroll="load"
    height="calc(100vh - 300px)"
    style="width: 100%">
    <el-table-column
      prop="claimId" width="100"
      label="ID">
    </el-table-column>
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
      prop="cover.coverPeriod" width="200"
      label="Cover PERIOD">
      <template slot-scope="scope">
        {{formatPeriod(scope.row)}}
      </template>
    </el-table-column>
    <el-table-column
      prop="cover.sumAssured" width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.cover.sumAssured}} BNB
      </template>
    </el-table-column>
    <el-table-column
      prop="status" width="150"
      label="STATUS">
      <template slot-scope="scope">
        <el-tag :type="statusFormatForTag(scope.row)">
          {{statusFormatForValue(scope.row)}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column width="100"
      label="ACTION">
      <template slot-scope="scope">
        <el-link type="primary" :disabled="assessed(scope.row)" v-if="canAssess(scope.row)" :underline="false" @click="assess(scope.row)">Assess</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ClaimsDataContract from '@/services/ClaimsData';
import QuotationDataContract from '@/services/QuotationData';
import Moment from 'moment';
import { getCoverContracts, loadCover } from '@/api/cover.js';
import { BigNumber } from 'bignumber.js';
import { STATUS, statusFormat } from '@/utils/claimStatus.js';


export default {
  name: "claims",
  components:{
  },
  data() {
    return {
      loading: false,
      dataLoading: false,
      claims: [],
      contracts: [],
      count: null,
      curId: 0,
      latestLoadTime: null,
      ClaimsData: null,
      QuotationData: null,
      onload: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ])
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
  },
  methods: {
    statusFormatForValue(row){
      return statusFormat(row).status;
    },
    statusFormatForTag(row){
      return statusFormat(row).tagType;
    },
    async initData(){
      await this.initContracts();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      if(this.onload){
        return;
      }
      this.ClaimsData = await this.getContract(ClaimsDataContract);
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.initClaimsCount();
      this.onload = true;
    },
    async initContracts(){
      if(this.contracts && this.contracts.length>0){
        return;
      }
      const response = await getCoverContracts(this);
      this.contracts = response.data;
    },
    async initClaimsCount(){
      this.claims.splice(0, this.claims.length);
      const instance = this.ClaimsData.getContract().instance;
      try{
        const count = await instance.actualClaimLength();
        this.count = parseInt(count);
        this.latestLoadTime = new Date().getTime();
        this.getClaims(this.count - 1, 5);
      }catch(e){
        console.info(e);
        this.$message.error(e.message);
      }
    },
    load(){
      if(this.dataLoading){
        // 数据加载中，直接返回
        return;
      }
      const curTime = new Date().getTime();
      if(this.latestLoadTime && curTime - this.latestLoadTime < 1000){
        // 间隔小于1秒的更新取消
        return;
      }
      this.latestLoadTime = curTime;
      this.getClaims(this.curId, 5);
    },
    async getClaims(start, size){
      if(this.dataLoading || (this.curId > 0 && start > this.curId)){
        // 数据加载中，直接返回
        return;
      }
      try{
        // 加锁，数据加载中....
        this.dataLoading = true;
        if(start <= 0){
          return;
        }

        let curload = start;
        let loadCount = 0;

        if(start == this.count - 1){
          // 第一次加载
          this.loading = true;
          this.claims = [];
        }
        const instance = this.ClaimsData.getContract().instance;
        while(true){
          this.curId = curload;
          if(curload <= 0){
            // 所有数据加载完成了
            break;
          }
          if(loadCount >= size){
            // 本次数据加载完成了
            break;
          }
          // 从缓存读取数据
          const claim = this.getObjectCache(curload.toString());
          if(claim){
            // 缓存数据更新状态
            console.info("cache data......");
            if(!claim.finished){
              const data = await instance.getClaimStatusNumber(curload.toString());
              const statno = data.statno.toString();
              claim.status = statno;
              if(BigNumber(statno).gt(5)){
                claim.finished = true;
              }else{
                await this.getVoteId(claim);
              }
            }
            // 缓存数据
            this.cacheObject(curload.toString(), claim);
            this.claims.push(claim);
            curload --;
            loadCount++;
            continue;
          }
          // 缓存未读到
          console.info("读取claim");
          claim = {};
          const claimData = await instance.getClaim(curload.toString());
          console.info(claimData);
          console.info("完成claim");
          claim.claimId = curload.toString();
          claim.coverId = claimData.coverId.toString();
          claim.dateUpd = claimData.dateUpd.toString();
          claim.state12Count = claimData.state12Count.toString();
          claim.status = claimData.status.toString();
          claim.vote = claimData.vote.toString();

          await this.getVoteId(claim);
          const cover = await loadCover(this, claim.coverId, true, this.contracts);
          claim.cover = cover;
          claim.contract = cover.contract;

          this.claims.push(claim);
          // 缓存数据
          this.cacheObject(curload.toString(), claim);
          console.info(claim);
          curload --;
          loadCount++;
        }
      }catch(e){
        this.loading = false;
        console.error(e);
        this.$message.error(e.message);
      }finally{
        // 解锁，数据加载完成
        this.dataLoading = false;
        if(this.loading){
          this.loading = false;
          this.getClaims(this.curId, 5);
        }
      }
    },
    async getVoteId(claim){
      const instance = this.ClaimsData.getContract().instance;
      const caVoteId = await instance.getUserClaimVoteCA(this.member.account, claim.claimId);
      claim.caVoteId = caVoteId.toString();
      const mvVoteId = await instance.getUserClaimVoteMember(this.member.account, claim.claimId);
      claim.mvVoteId = mvVoteId.toString();
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
    },
    canAssess(row){
      return BigNumber(row.status).lt(6);
    },
    assessed(row){
      return !this.member.isMember || (BigNumber(row.status).eq(0) && BigNumber(row.caVoteId).gt(0)) 
        || (BigNumber(row.status).lt(6) && BigNumber(row.mvVoteId).gt(0));
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-open{
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
