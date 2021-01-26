<template>
  <div id="stats-staking" class="app-container">
    <el-divider content-position="left">
      <h4>Staking</h4>
    </el-divider>
    <el-form label-width="200px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Total Amount Staked">
            <div class="skeleton" v-if="loadingStaked">
              <Skeleton class="skeleton-item" active :paragraph="{rows:1}" :title="false"/>
            </div>
            <highlight v-else><span v-format="'#,##0.00'">{{$etherToNumber(allStaked)}}</span> SOTE</highlight>
            <!-- <highlight v-else>{{bnbStaked}} BNB / ${{bnbStakedUSD}}</highlight> -->
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Total Staking Reward">
            <div class="skeleton" v-if="loadingRewards">
              <Skeleton class="skeleton-item" active :paragraph="{rows:1}" :title="false"/>
            </div>
            <highlight v-else><span v-format="'#,##0.00'">{{$etherToNumber(allRewards)}}</span> SOTE</highlight>
            <!-- <highlight v-else>{{bnbRewards}} BNB / ${{bnbRewardsUSD}}</highlight> -->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import PooledStakingContract from '@/services/PooledStaking';
import { getStakeProjects } from '@/api/stake.js';
import { BigNumber } from 'bignumber.js';
import MemberRolesContract from '@/services/MemberRoles';

export default {
  components: { },
  props: ["options"],
  data() {
    return {
      PooledStaking: null,
      MemberRoles: null,
      projects: [],
      allStaked: 0,
      allRewards: 0,
      loadingStaked: true,
      loadingRewards: true,
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member']),
    bnbStaked(){
      return BigNumber(this.$etherToValue(this.allStaked)).times(this.options.rate).toFixed(2, 1);
    },
    bnbStakedUSD(){
      return BigNumber(this.bnbStaked).times(this.member.bnbQuote).toFixed(2, 1);
    },
    bnbRewards(){
      return BigNumber(this.$etherToValue(this.allRewards)).times(this.options.rate).toFixed(2, 1);
    },
    bnbRewardsUSD(){
      return BigNumber(this.bnbRewards).times(this.member.bnbQuote).toFixed(2, 1);
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
    async initData() {
      if(this.projects.length == 0){
        try{
          const response = await getStakeProjects(this);
          this.projects = response.data;
        }catch(e){
          console.error("Get projects failed.", e);
        }
      }
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      if(!this.PooledStaking) this.PooledStaking = await this.getContract(PooledStakingContract);
      if(!this.MemberRoles) this.MemberRoles = await this.getContract(MemberRolesContract);
      this.getAllStaked();
      this.getAllRewards();
    },
    getAllStaked(){
      const instance = this.PooledStaking.getContract().instance;
      if(this.projects.length==0){
        this.loadingStaked = false;
        return;
      }
      this.loadingStaked = true;
      this.projects.forEach(async (item, index) => {
        const res = await instance.contractStake(item.address);
        this.allStaked = BigNumber(this.allStaked).plus(res.toString()).toString();
        if(index == this.projects.length - 1){
          this.loadingStaked = false;
          this.options.allStaked = this.allStaked;
        }
      });
    },
    async getAllRewards(){
      const instance = this.PooledStaking.getContract().instance;
      let members = [];
      for(let i=0;i<4;i++){
        const res = await this.loadMembers(i);
        console.info(res);
        if(res.memberArray){
          members = members.concat(res.memberArray.map(item => {
            return {address: item.toString()};
          }));
        }
      }
      if(members.length==0){
        this.loadingRewards = false;
        return;
      }
      members.forEach(async (item, index) => {
        const res = await instance.stakerReward(item.address);
        this.allRewards = BigNumber(this.allRewards).plus(res.toString()).toString();
        if(index == members.length - 1){
          this.loadingRewards = false;
        }
      });
    },
    async loadMembers(role){
      const instance = this.MemberRoles.getContract().instance;
      const res = await instance.members(role);
      return res;
    }
  }
}
</script>
<style lang="scss" scoped>
#stats-staking{
  .skeleton{
    display: table;
    height: 40px;
    width: 100%;
  }
  .skeleton-item{
    display: table-cell;
    vertical-align: middle;
  }
}
</style>
