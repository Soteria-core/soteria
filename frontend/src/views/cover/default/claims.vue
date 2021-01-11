<template>
  <el-table
    id="cover-default-claims"
    :data="options.claims"
    stripe
    v-loading.fullscreen.lock="false"
    element-loading-text="Claims loading ..."
    v-el-table-infinite-scroll="load"
    height="calc(100vh - 300px)"
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
      prop="claimId" width="100"
      label="Claim ID">
    </el-table-column>
    <el-table-column
      prop="coverId" width="100"
      label="Cover ID">
    </el-table-column>
    <el-table-column
      prop="cover.sumAssured" width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.cover.sumAssured}} BNB
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
      prop="status" width="150"
      label="STATUS">
      <template slot-scope="scope">
        <el-tag :type="statusFormatForTag(scope.row)" :class="{ 'el-tag-blue': statusFormatForTag(scope.row)=='' }">
          {{statusFormatForValue(scope.row)}}
        </el-tag>
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
import { STATUS, statusFormatForMember } from '@/utils/claimStatus.js';
import { BigNumber } from 'bignumber.js';

export default {
  name: "claims",
  components:{
  },
  props: ["options"],
  data() {
    return {
      loading: false,
      dataLoading: false,
      claims: [],
      contracts: [],
      count: null,
      curId: -1,
      latestLoadTime: null,
      ClaimsData: null,
      QuotationData: null,
      key: "member_claim_",
      onload: false,
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
      this.onload = false;
      this.initData();
    });
  },
  methods: {
    statusFormatForValue(row){
      return statusFormatForMember(row).status;
    },
    statusFormatForTag(row){
      return statusFormatForMember(row).tagType;
    },
    async initData(){
      await this.initContracts();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      if(!this.onload){
        this.ClaimsData = await this.getContract(ClaimsDataContract);
        this.QuotationData = await this.getContract(QuotationDataContract);
        this.initClaimsCount();
        this.onload = true;
      }
    },
    async initContracts(){
      if(this.contracts && this.contracts.length>0){
        return;
      }
      const response = await getCoverContracts(this);
      this.contracts = response.data;
    },
    async initClaimsCount(){
      this.options.claims.splice(0, this.options.claims.length);
      const instance = this.ClaimsData.getContract().instance;
      try{
        this.claimIds = await instance.getAllClaimsByAddress(this.member.account);
        if(this.claimIds.length > 0){
          this.latestLoadTime = new Date().getTime();
          this.getClaims(this.claimIds.length - 1, 5);
        }
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
      console.info(start);
      try{
        if(this.dataLoading){
          // 数据加载中，直接返回
          return;
        }
        // 加锁，数据加载中....
        this.dataLoading = true;
        if(start <= -1){
          return;
        }

        let curload = start;
        let loadCount = 0;

        if(start == this.claimIds.length - 1){
          // 第一次加载
          this.loading = true;
          this.options.claims = [];
        }
        const instance = this.ClaimsData.getContract().instance;
        while(true){
          if(curload <= -1){
            this.curId = curload;
            // 所有数据加载完成了
            break;
          }
          if(loadCount >= size){
            // 本次数据加载完成了
            this.curId = curload;
            break;
          }
          // 从缓存读取数据
          const curClaimId = this.claimIds[curload].toString();
          let claim = this.getObjectCache(this.key + curClaimId);
          if(claim){
            // 缓存数据更新状态
            console.info("cache data......");
            if(!claim.finished){
              const data = await instance.getClaimStatusNumber(curClaimId);
              const statno = data.statno.toString();
              claim.status = statno;
              if(BigNumber(statno).gt(5)){
                claim.finished = true;
              }
              // 缓存数据
              this.cacheObject(this.key + curClaimId, claim);
            }
            this.options.claims.push(claim);
            curload --;
            loadCount++;
            continue;
          }
          // 缓存未读到
          console.info("读取claim");
          claim = {};
          const claimData = await instance.getClaim(curClaimId);
          console.info(claimData);
          console.info("完成claim");
          claim.claimId = curClaimId;
          claim.coverId = claimData.coverId.toString();
          claim.dateUpd = claimData.dateUpd.toString();
          claim.state12Count = claimData.state12Count.toString();
          claim.status = claimData.status.toString();
          claim.vote = claimData.vote.toString();

          const cover = await loadCover(this, claim.coverId, false, this.contracts);
          claim.cover = cover;
          claim.contract = cover.contract;

          this.options.claims.push(claim);
          // 缓存数据
          this.cacheObject(this.key + curClaimId, claim);
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
#cover-default-claims{
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
