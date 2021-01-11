<template>
  <div v-loading.fullscreen.lock="loading"
    element-loading-text="Withdraw membership...">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="page-title">My SOTE holdings</span>
        <span class="right-bottom"><el-button type="primary" :disabled="canNotWithdraw" round @click="withdraw">Withdraw Membership</el-button></span>
      </div>
      <el-table
        :data="tableData"
        stripe show-summary
        :summary-method="getSummaries"
        sum-text="Total:"
        style="width: 100%">
            <el-table-column
              prop="availableFunds"
              label="AVAILABLE FUNDS"
              >
            </el-table-column>
            <el-table-column
              prop="amount"
              label="AMOUNT"
              :formatter="amountFormat"
              >
            </el-table-column>
            <el-table-column
              prop="withdrawable"
              :formatter="amountFormat"
              label="WITHDRAWABLE">
            </el-table-column>
            <el-table-column
              prop="action"
              width="120px"
              label="ACTION">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  :disabled="isDisabled(scope.row)"
                  icon="el-icon-view"
                  @click="handleAction(scope.row)"
                >
                  {{scope.row.type}}
                </el-button>
              </template>
            </el-table-column>
      </el-table>
    </el-card>
    <br />
    <withdraw />
  </div>
</template>

<script>
import styles from '@/styles/element-variables.scss';
import MemberRolesContract from '@/services/MemberRoles';
import TokenControllerContract  from '@/services/TokenController';
import { mapGetters } from 'vuex'
import { watch } from '@/utils/watch.js';
import memberData from '@/views/member/data/memberData.json';
import { getMemberData } from '@/api/member.js';
import { BigNumber } from 'bignumber.js';
import withdraw from './withdraw';

export default {
  name: 'Membership',
  components:{ withdraw },
  data() {
    return {
      loading : false,
      MemberRoles: null,
      tableData: memberData,
      TokenController: null,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
	  'settings'
    ]),
    hasCoverAndStake(){
      return BigNumber(this.member.coverDeposit).gt(0) || BigNumber(this.member.assessment).gt(0) || BigNumber(this.member.stakeDeposit).gt(0);
    },
    hasLockedOfGo(){
      return false;
    },
    hasRewards(){
      return BigNumber(this.member.rewards).gt(0);
    },
    hasBalance(){
      return BigNumber(this.member.balance).gt(0);
    },
    canNotWithdraw(){
      return this.hasCoverAndStake || this.hasLockedOfGo || this.hasRewards || this.hasBalance;
    }
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
		if(this.settings.networkVersion == 97){
		  getMemberData(this);
		}
      }
    },
    async initContract(){
      this.MemberRoles = await this.getContract(MemberRolesContract);
      this.TokenController = await this.getContract(TokenControllerContract);
      console.info("MemberRoles:", this.MemberRoles);
      this.$Bus.$emit(this.$EventNames.refreshAllowance, this.settings.contracts.TokenController, "TokenController");
    },
    withdraw(){
      if(this.member.allowance == "0"){
        this.$message.error("Grant TokenController permission is 0 SOTE, Please grant TokenController enough permission.");
        return;
      }
      if(this.member.allowance < this.member.balance){
        this.$message.error(`Grant TokenController permission is ${this.member.allowance} SOTE, Please grant TokenController enough permission.`);
        return;
      }
      this.$confirm(`All the SOTE coins in your account will be burned after membership withdrawn. Do you want to continue?`, 'Tooltip', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.withdrawMembership();
      }).catch(() => {
      });
    },
    withdrawMembership(){
      this.loading = true;
      const contract = this.MemberRoles.getContract();
      contract.instance.withdrawMembership({ from: this.$CustomWeb3.account }).then(response => {
        console.info(response, response.toString());
        this.$message.success("Withdraw membership successfully!");
        this.$Bus.$emit(this.$EventNames.initMember, this); // 刷新会员状态
        this.loading = false;
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    },
    amountFormat(row, column){
      const value = this.getColumnValue(row, column);
      return value != "N/A" ? value + " SOTE" : value;
    },
    getColumnValue(row, column){
      if(column.property == "amount"){
        return this.$etherToNumber(this.member[row.amount]);
      }
      if(column.property == "withdrawable" && row.withdrawable && row.withdrawable!="0"){
        return this.$etherToNumber(this.member[row.withdrawable]);
      }
      if(row[column.property] == undefined || row[column.property] == null){
        return "N/A";
      }
      return row[column.property];
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Total:';
          return;
        }
        if (index === columns.length - 1) {
          sums[index] = '';
          return;
        }
        const values = data.map(item => Number(this.getColumnValue(item, column)));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return BigNumber(prev).plus(curr).toString();
            } else {
              return prev;
            }
          }, 0);
          sums[index] += ' SOTE';
        } else {
          sums[index] = 'N/A';
        }
      });
      return sums;
    },
    isDisabled(row){
      const value = this.member[row.withdrawable] ? this.member[row.withdrawable] : row.withdrawable;
      return BigNumber(value).lte(0);
    },
    handleAction(row){
      if(row.amount == "balance"){
        this.$router.replace("/start/swap");
        return;
      }else if(row.amount == "coverDeposit"){
        this.$router.replace("/system/cover/default");
        return;
      }else if(row.amount == "stakeDeposit"){
        this.$router.replace("/system/stake/default");
        return;
      }else if(row.amount == "assessment"){
        this.withdrawAssessment();
        return;
      }
      this.$message.info(`Click row ${row.availableFunds}`);
    },
    withdrawAssessment(){
      this.loading = true;
      const instance = this.TokenController.getContract().instance;
      instance.unlock(this.member.account, { from: this.member.account }).then(res => {
        console.info(res, res.toString());
        this.$message.success("Unlock successfully!");
        this.loading = false;
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    }
  }
}

</script>

<style lang="scss" scoped>
.right-bottom {
    float: right;
}
</style>
