<template>
  <div>
    <el-card class="box-card">
      <el-table
        :data="options.stakedProjects"
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
          prop="stake"
          label="STAKED">
          <template slot-scope="scope">
            {{toFixed(scope.row.ownerStaked)}} SOTE
          </template>
        </el-table-column>
        <el-table-column width="200px"
          label="OPTIONS">
          <template slot-scope="scope">
            <el-link type="primary" v-if="isUnstake(scope.row)" :underline="false" @click="unstake" style="margin-right:20px;">Unstake</el-link>
            <el-link type="primary" :underline="false" @click="addMore('deposit')">Stake</el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <div style="text-align: center;">
          <el-button type="text" @click="addMore">Add more projects</el-button>
        </div>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {

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
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    toFixed(value){
      return BigNumber(value).toFixed(2, 1);
    },
    isUnstake(row){
      return BigNumber(row.ownerStaked).gt(0) && BigNumber(row.unstaked).eq(0);
    },
    addMore(param){
      this.options.redirect = "deposit";
      this.$router.push({name: "StakeStake", params: JSON.parse(JSON.stringify(this.options))});
    },
    unstake(){
      this.$router.push({name: "Unstake", params: JSON.parse(JSON.stringify(this.options))});
    }
  }
}
</script>

<style>
</style>
