<template>
  <el-card id="stake-history-history" class="box-card">
    <h3 class="main-text">Unstake history</h3>
    <div class="secondary-text">
      <el-table
        :data="historyList"
        stripe
        style="width: 100%">
        <el-table-column
          prop="name"
          label="PROJECT">
          <template slot-scope="scope">
            <img :src="scope.row.icon" class="project-list-icon" />
            {{scope.row.name}}
          </template>
        </el-table-column>
        <el-table-column
          prop="unstaked"
          label="AMOUNT">
          <template slot-scope="scope">
            {{$toFixed(scope.row.unstaked)}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="unstakeAt"
          label="REQUEST" :formatter="requestDate">
        </el-table-column>
        <el-table-column
          label="DUE" :formatter="due">
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'
import PooledStakingContract from '@/services/PooledStaking'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
      PooledStaking: null,
      historyList: [],
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
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
    initData(){
      this.historyList = this.options.stakedProjects.filter(item => BigNumber(item.unstaked).gt(0));
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.PooledStaking = await this.getContract(PooledStakingContract);
      this.getHistoryInfo();
    },
    async getHistoryInfo(){
      const instance = this.PooledStaking.getContract().instance;
      const reqId = await instance.lastUnstakeRequestId();
      let curId = reqId.toString();
      const unstakedList = [];
      while(true){
        if(BigNumber(curId).lt(0)){
          return;
        }
        const count = this.historyList.filter(item => !item.unstakeAt).length;
        if(count == 0){
          // 当前账户数据已加载完成
          return;
        }
        const unstaked = await instance.unstakeRequestAtIndex(curId.toString());
        const stakerAddress = unstaked.stakerAddress.toString();
        const contractAddress = unstaked.contractAddress.toString();
        if(stakerAddress == "0x0000000000000000000000000000000000000000"){
          // 后面的已经过了有效期了，不再查了
          return;
        }
        if(stakerAddress.toLowerCase() == this.member.account.toLowerCase()){
          const stakedProjects = this.historyList;
          for(let i=0;i<stakedProjects.length;i++){
            let item = stakedProjects[i];
            if(item.address.toLowerCase() == contractAddress.toLowerCase()){
              this.$set(this.historyList[i], "unstakeAt", unstaked.unstakeAt.toString());
              this.$set(this.historyList[i], "next", unstaked.next.toString());
              console.info(this.historyList);
              break;
            }
          }
        }
        curId = BigNumber(curId).minus(1).toString();
      }
    },
    due(row){
      if(row.unstakeAt){
        return this.$secondsToDateString(row.unstakeAt);  
      }
      return "-";
    },
    requestDate(row){
      if(row.unstakeAt){
        return this.$secondsToDateString(BigNumber(row.unstakeAt).minus(BigNumber(this.settings.unstakedPendingDay).times(24 * 60 * 60)).toString());  
      }
      return "-";
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-history-history{
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
  .secondary-text{
    line-height: 35px;
  }
}
</style>
