<template>
  <div id="stake-unstake-projects">
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
          prop="ownerStaked"
          label="AVAILABLE AMOUNT">
          <template slot-scope="scope">
            {{formatStaked(scope.row)}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="unstaking"
          label="UNSTAKE">
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item prop="unstaking" :rules="rules(scope.row)">
                <el-input-number size="mini" v-model="scope.row.unstaking" :min="0" class="right-input">
                </el-input-number>SOTE
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="unstaked"
          label="PENDING UNSTAKED">
          <template slot-scope="scope">
            {{unstaked(scope.row)}}
          </template>
        </el-table-column>
      </el-table>
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
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    unstaked(row){
      return BigNumber(row.unstaking).plus(row.unstaked).toFixed(2, 1);
    },
    toFixed(value){
      return BigNumber(value).toFixed(2, 1);
    },
    formatStaked(row){
      return BigNumber(row.ownerStaked).minus(row.unstaking).minus(row.unstaked).toFixed(2, 1);
    },
    rules(row){
      return [{ trigger: 'blur', validator: (rule, value, callback) => {
        this.validateUnstaking(rule, value, callback, row);
      } }];
    },
    validateUnstaking(rule, value, callback, row){
      this.options.error = null;
      const unstake = BigNumber(value).plus(row.unstaked);
      
      const remainingStaked = BigNumber(row.ownerStaked).minus(unstake);
      // 剩余的stake必须大于20，或者全部unstake
      if(remainingStaked.lt(0)){
        this.options.error = `The unstake cannot greater than the stake.`;
        callback(new Error(`The unstake cannot greater than the stake.`));
        return;
      }
      // 剩余的stake必须大于20，或者全部unstake
      if(remainingStaked.gt(0) && remainingStaked.lt(this.settings.stake.minAmountPerContract)){
        this.options.error = `Remaining stake ${this.settings.stake.minAmountPerContract} SOTE minumum per contract.`;
        callback(new Error(`Remaining stake ${this.settings.stake.minAmountPerContract} SOTE minumum per contract.`));
        return;
      }
      // unstaking 最少20
      if(BigNumber(value).gt(0) && BigNumber(value).lt(this.settings.stake.minAmountPerContract)){
        this.options.error = `Unstake ${this.settings.stake.minAmountPerContract} SOTE minumum per contract.`;
        callback(new Error(`Unstake ${this.settings.stake.minAmountPerContract} SOTE minumum per contract.`));
        return;
      }
      callback();
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-unstake-projects{
  .el-form-item{
    margin-bottom: 0px;
  }
}
</style>
<style lang="scss">
    .right-input {
        .el-input__inner {
            text-align: right !important;
        }
    }
</style>
