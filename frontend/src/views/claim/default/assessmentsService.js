import ClaimsContract from '@/services/Claims';
import ClaimsDataContract from '@/services/ClaimsData';
import { loadCover } from '@/api/cover.js';
import { BigNumber } from 'bignumber.js';

class AssessmentsService {
  // type: CA, MV
  constructor(vue, claims, type, contracts) {
    this.key = "assess_";
    this.vue = vue;
    this.type = type || "CA";
    this.dataLoading = false;
    this.claims = claims;
    this.curId = -1;
    this.count = 0;
    this.latestLoadTime = null;
    
    this.contracts = contracts;
    
    this.initClaimsCount();
    console.info("加载assessments");
  }
  
  async initClaimsCount(){
    this.Claims = await this.vue.getContract(ClaimsContract);
    this.ClaimsData = await this.vue.getContract(ClaimsDataContract);
    
    const instance = this.ClaimsData.getContract().instance;
    try{
      let count = 0;
      if(this.type == "CA"){
        count = await instance.getVoteAddressCALength(this.vue.member.account);
      }else {
        count = await instance.getVoteAddressMemberLength(this.vue.member.account);
      }
      this.count = parseInt(count);
      this.latestLoadTime = new Date().getTime();
      this.getClaims(this.count - 1, 5);
    }catch(e){
      console.info(e);
      this.vue.$message.error(e.message);
    }
  }
  
  loadData(){
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
  }
  
  async getClaims(start, size){
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
  
      if(start == this.count - 1){
        // 第一次加载
        this.vue.loading = true;
        this.claims.splice(0, this.claims.length);
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
        
        const voteIndex = await this.getVoteId(curload);
        const vote = await this.loadVote(voteIndex);
        let finalVerdict = null;
  
        // 从缓存读取数据
        let claim = this.vue.getObjectCache(this.key + vote.claimId);
  
        if(claim){
          // 缓存数据更新状态
          console.info("cache data......");
          
          claim.vote = vote;
          
          if(claim.finalVerdict && BigNumber(claim.finalVerdict).eq(0)){
            finalVerdict = await instance.getFinalVerdict(claim.claimId);
            claim.finalVerdict = finalVerdict.toString();
          }
          this.claims.push(claim);
          // 缓存数据
          this.vue.cacheObject(this.key + claim.claimId, claim);
          curload --;
          loadCount++;
          continue;
        }else{
          // 缓存未读到
          console.info("读取claim");
          claim = {};
          claim.type = this.type;
          await this.loadClaim(vote.claimId, claim);
          console.info("完成claim");
  
          // 查cover
          const cover = await loadCover(this.vue, claim.coverId, false, this.contracts);
          claim.cover = cover;
          claim.contract = cover.contract;
          
          claim.vote = vote;
          
          this.claims.push(claim);
          // 缓存数据
          this.vue.cacheObject(this.key + claim.claimId, claim);
        }
        
        console.info(claim);
        curload --;
        loadCount++;
      }
    }catch(e){
      this.vue.loading = false;
      console.error(e);
      this.vue.$message.error(e.message);
    }finally{
      // 解锁，数据加载完成
      this.dataLoading = false;
      if(this.vue.loading){
        this.vue.loading = false;
        this.getClaims(this.curId, 5);
      }
    }
  }
  async getVoteId(curload){
    const instance = this.ClaimsData.getContract().instance;
    let voteIndex = -1;
    if(this.type == "CA"){
      voteIndex = await instance.getVoteAddressCA(this.vue.member.account, curload.toString());
    }else{
      voteIndex = await instance.getVoteAddressMember(this.vue.member.account, curload.toString());
    }
    return voteIndex.toString();
  }
  async loadVote(voteIndex){
    const instance = this.ClaimsData.getContract().instance;
    const vote = await instance.getVoteDetails(voteIndex.toString());
    return {
      claimId: vote.claimId.toString(),
      tokens: vote.tokens.toString(),
      verdict: vote.verdict.toString(),
      rewardClaimed: vote.rewardClaimed.toString()
    };
  }
  async loadClaim(claimId, claim){
    const instance = this.Claims.getContract().instance;
    const claimData = await instance.getClaimbyIndex(claimId.toString());
    claim.claimId = claimData.claimId.toString();
    claim.status = claimData.status.toString();
    claim.finalVerdict = claimData.finalVerdict.toString();
    claim.claimOwner = claimData.claimOwner.toString();
    claim.coverId = claimData.coverId.toString();
    return claim;
  }
  
}
export default AssessmentsService