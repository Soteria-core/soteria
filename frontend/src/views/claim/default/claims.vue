<template>
  <el-table
    id="claim-default-open"
    :data="claims"
    stripe
    v-loading.fullscreen.lock="loading"
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
      prop="cover.coverPeriod"
      min-width="200"
      label="Cover PERIOD">
      <template slot-scope="scope">
        {{formatPeriod(scope.row)}}
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
      prop="status"
      min-width="150"
      label="STATUS">
      <template slot-scope="scope">
        <el-tag :type="statusFormatForTag(scope.row)">
          {{statusFormatForValue(scope.row)}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      min-width="100"
      label="ACTION">
      <template slot-scope="scope">
        <el-link type="primary" :disabled="assessed(scope.row)" v-if="canAssess(scope.row)" :underline="false" @click="assess(scope.row)">Assess</el-link>
        <el-link type="primary" v-if="scope.row.voteClosing==1" :underline="false" @click="closeClaim(scope.row)">Close Claim</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ClaimsContract from '@/services/Claims';
import ClaimsDataContract from '@/services/ClaimsData';
import QuotationDataContract from '@/services/QuotationData';
import TokenControllerContract from '@/services/TokenController';
import TokenDataContract from '@/services/TokenData';
import SOTEMaster from '@/services/SOTEMaster';
import { getCoverContracts, loadCover } from '@/api/cover.js';
import { BigNumber } from 'bignumber.js';
import { statusFormat } from '@/utils/claimStatus.js';


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
      Claims: null,
      ClaimsData: null,
      QuotationData: null,
      SOTEMaster: null,
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
      this.Claims = await this.getContract(ClaimsContract);
      this.ClaimsData = await this.getContract(ClaimsDataContract);
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.TokenController = await this.getContract(TokenControllerContract);
      this.TokenData = await this.getContract(TokenDataContract);
      this.SOTEMaster = await this.getContract(SOTEMaster);
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
          //this.loading = true;
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
              await this.expireTime(claim);
              await this.checkVoteClosing(claim);
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

          await this.expireTime(claim);
          await this.getVoteId(claim);
          await this.checkVoteClosing(claim);
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
    async checkVoteClosing(claim) {
      const instance = this.Claims.getContract().instance;
      const status = await instance.checkVoteClosing(claim.claimId);
      claim.voteClosing = status.toString()
    },
    async expireTime(claim){
      if(claim.status == 3){
        const instance = this.ClaimsData.getContract().instance;
        const maxVotingTime = await instance.maxVotingTime();
        claim.maxVotingTime = maxVotingTime.toString();
      }
    },
    async getVoteId(claim){
      const instance = this.ClaimsData.getContract().instance;
      const caVoteId = await instance.getUserClaimVoteCA(this.member.account, claim.claimId);
      claim.caVoteId = caVoteId.toString();
      const mvVoteId = await instance.getUserClaimVoteMember(this.member.account, claim.claimId);
      claim.mvVoteId = mvVoteId.toString();
    },
    async getClaimStatusNumber(claim) {
      const instance = this.ClaimsData.getContract().instance;
      const status = await instance.getClaimStatusNumber(claim.claimId);
      claim.statusNumber = status.statno.toString()
    },
    async closeClaim(row) {
      this.loading = true;
      const instance = this.SOTEMaster.getContract().instance;
      instance.closeClaim(row.claimId, { from: this.member.account }).then(response => {
          console.info(response, response.toString());
          row.voteClosing = '-2';
          this.loading = false;
      }).catch((e) => {
          console.error(e);
          this.$message.error(e.message);
          this.loading = false;
      });
    },
    formatPeriod(row){
      if(row.cover && row.cover.validUntil){
        return this.$secondsToDateString(row.cover.purchase) + " - " + this.$secondsToDateString(row.cover.validUntil);
      }
      return "-";
    },
    formatStatus(row){

    },
    /*
    上链调用的是 Claims合约的 submitCAVote(uint claimId, int8 verdict) 方法,需要校验
    1. 调用 claims合约的 checkVoteClosing(uint claimId) 方法,如果返回的值等于1,则提示 投票已结束
    2. 调用 claimsData合约的 userClaimVotePausedOn(address userAddress) 方法，返回值记为 a,调用 claimsData合约的 pauseDaysCA()方法,
    返回值记为b,则当 a + b > 当前时间戳(秒)，则提示 不能连续评估
    3. 调用 tokenController合约的 tokensLockedAtTime(address _of, bytes32 _reason, uint256 _time)方法，返回值等于0，则提示 可用sote不足
    参数1: 用户地址
    参数2: CLA
    参数3: now.add(cd.claimDepositTime()),即当前时间戳加上调用 claimsData合约的 claimDepositTime返回值
    4. 调用 claimsData合约的 getClaimStatusNumber(uint _claimId)方法，返回值如果不等于0,则提示 索赔已过期
    5. 调用 claimsData合约 getUserClaimVoteCA(address _add,uint _claimId)方法，如果返回值不等于0，则提示 已投票
    6. 调用 tokenData合约的 isCATokensBooked(address _of)方法，参数是用户地址，如果返回true，则提示 Tokens already booked
    */
    async assess(row){
      // await this.checkVoteClosing(row)
      // await this.getVoteId(row)
      // await this.getClaimStatusNumber(row)

      const instance = this.ClaimsData.getContract().instance;
      const instance1 = this.TokenController.getContract().instance;
      const instance2 = this.TokenData.getContract().instance;
      const [claimVotePauseOn, pauseDaysCA, period, isCATokensBooked] = await Promise.all([
        instance.userClaimVotePausedOn(this.member.account),
        instance.pauseDaysCA(),
        instance1.getLockedTokensValidity(this.member.account, this.$CLA_BYTE),
        instance2.isCATokensBooked(this.member.account)
      ])
      // const claimVotePauseOn = await instance.userClaimVotePausedOn(this.member.account);
      // const pauseDaysCA = await instance.pauseDaysCA();
      // const period = await tokenControllerInstance.getLockedTokensValidity(this.member.account, this.$CLA_BYTE)
      const _claimVotePauseOn = +claimVotePauseOn.toString();
      const _pauseDaysCA = +pauseDaysCA.toString();
      const _period = +period.toString();
      const curTime = Math.round(new Date() / 1000);
      // const instance1 = this.TokenController.getContract().instance;
      // const depositTime = await instance.claimDepositTime();
      // const _depositTime = +depositTime.toString();
      // const tokensLock = await instance1.tokensLockedAtTime(this.member.account, this.$CLA_BYTE, curTime + _depositTime);
      // const _tokensLock = tokensLock.toString();

      // console.log('_tokensLock', _tokensLock, _depositTime)

      // const instance2 = this.TokenData.getContract().instance;
      // const isCATokensBooked = await instance2.isCATokensBooked(this.member.account);

      // if(row.voteClosing == 1) {
      //   this.$message.error("Vote is closed");

      if( _claimVotePauseOn + _pauseDaysCA > curTime ){
        this.$message.error("Cannot continuously assess");

      // } else if(_tokensLock == 0 ) {
      //   this.$message.error("Insufficient sote token");

      // } else if( row.statusNumber != 0 ){
      //   this.$message.error("Claim is expired");

      // } else if( row.caVoteId != 0 ){
      //   this.$message.error("Already voted");

      } else if( isCATokensBooked ) {
        this.$message.error("Tokens already booked");
      } else if (_period - 7*24*60*60 < curTime) {
        this.$message.error("The remaining time of the stake period is less than 7 days");
      } else {
        this.$emit("assess", row);
      }
      //this.$router.push({ name: this.$RouteNames.COVER_CLAIM, params: JSON.parse(JSON.stringify(row)) });
    },
    canAssess(row){
      if (parseInt(row.voteClosing) === 1 || parseInt(row.voteClosing) === -2) {
        return false
      }
      if(parseInt(row.status) == 3){
        const curTime = new Date().getTime();
        const expireTime = BigNumber(row.dateUpd).plus(row.maxVotingTime).times(1000);
        if(expireTime.lt(curTime)){
          return false;
        }
      }
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
