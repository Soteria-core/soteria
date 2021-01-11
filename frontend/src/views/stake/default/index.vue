<template>
  <div id="stake-default" v-loading.fullscreen.lock="false"
        element-loading-text="Data is loading ...">
    <div v-if="options.stakedProjects.length == 0">
      <overall :options="options"/>
      <br/>
      <introduce />
    </div>
    <div v-else>
      <staked :options="options" ref="staked" @refresh="refresh"></staked>
    </div>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import overall from '@/views/stake/default/overall';
import introduce from '@/views/stake/default/introduce';
import staked from './staked/index';
import PooledStakingContract from '@/services/PooledStaking'
import ClaimsRewardContract from '@/services/ClaimsReward.js';
import { BigNumber } from 'bignumber.js'
import { getStakeProjects } from '@/api/stake.js';
import {getRewards} from "@/api/member";

export default {
  components:{
    overall, introduce, staked
  },
  data() {
    return {
      loading: true,
      projects: [],
      options: {
        deposit: 0,
        rewards: 0,
        unstaked: 0,
        stakedProjects: [],
        redirect: null,
        allStaked: 0,
      },
      PooledStaking: null,
      ClaimsReward: null,
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
      this.PooledStaking = await this.getContract(PooledStakingContract);
      this.ClaimsReward = await this.getContract(ClaimsRewardContract);
      this.loading = true;
      this.getAllStaked();
      this.getDeposit();
      this.getRewards();
      this.getStakedProjects();
    },
    refresh(params){
      if(params == "rewards"){
        this.getRewards();
      }
    },
    getAllStaked(){
      const instance = this.PooledStaking.getContract().instance;
      this.projects.forEach((item, index) => {
        instance.contractStake(item.address).then(res => {
          this.options.allStaked = BigNumber(this.options.allStaked).plus(res.toString()).toString();
        });
      });
    },
    getDeposit(){
      const contract = this.PooledStaking.getContract();
      contract.instance.stakerDeposit(this.member.account).then(res => {
        this.options.deposit = this.$etherToValue(res.toString());
      });
    },
    getRewards(){
      const contract = this.PooledStaking.getContract();
      contract.instance.stakerReward(this.member.account).then(res => {
        this.options.rewards = this.$etherToValue(res.toString());
      });
      getRewards(this);
    },
    getStakedProjects(){
      const contract = this.PooledStaking.getContract();
      this.options.stakedProjects = [];
      contract.instance.stakerContractsArray(this.member.account).then(async res => {
        const stakedProjects = res;
        const map = {};
        this.projects.filter(item=>stakedProjects.indexOf(item.address)>=0).forEach(item=>{
          const project = JSON.parse(JSON.stringify(item));
          if(!project.stake){
            project.stake = "0";
          }
          map[project.address] = project;
        });
        // 按顺序加载已stake合约，否则不能顺利进行下次stake
        for(let i=0;i<stakedProjects.length;i++){
          const item = map[stakedProjects[i]];
          if(item){
            await this.setStakedAndUnstakedForAddress(item);
            this.options.stakedProjects.push(item);
          }
        }
        this.loading = false;
      }).catch((e)=>{
        this.$message.error(e.message);
        this.loading = false;
      });
    },
    async setStakedAndUnstakedForAddress(item){
      try{
        item.stakedStatus = "staked";// 代表已经stake过了
        const contract = this.PooledStaking.getContract();
        const instance = contract.instance;
        const ownerStaked = await instance.stakerContractStake(this.member.account, item.address);
        item.ownerStaked = this.$etherToValue(ownerStaked.toString());

        const unstaked = await instance.stakerContractPendingUnstakeTotal(this.member.account, item.address);
        item.unstaked = this.$etherToValue(unstaked.toString());
        item.unstaking = 0;
      }catch(e){
        console.error(e);
        this.$message.error(e.message);
      }
    },
  }
}
</script>
