<template>
  <div id="member-withdraw">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span class="page-title">Withdraw membership</span>
          </div>
          <div class="normal-text">
            Membership can be withdrawn only if the following conditions are met:
            <div :class="{important: hasCoverAndStake}">
              <svg-icon icon-class="circle" :class="{'icon-name': true, green: !hasCoverAndStake}"></svg-icon>
              No <highlight> active covers </highlight> or
              <highlight>tokens staked</highlight>
              on claim assessment or pooled staking.
            </div>
            <div :class="{important: hasLockedOfGo}">
              <svg-icon icon-class="circle" :class="{'icon-name': true, green: !hasLockedOfGo}"></svg-icon>
              No <highlight>tokens locked</highlight>
              in <highlight>governance voting</highlight>.
            </div>
            <div :class="{important: hasRewards}">
              <svg-icon icon-class="circle" :class="{'icon-name': true, green: !hasRewards}"></svg-icon>
              No <highlight>rewards</highlight> pending to be claimed.
            </div>
            <div :class="{important: hasBalance}">
              <svg-icon icon-class="circle" :class="{'icon-name': true, green: !hasBalance}"></svg-icon>
              Your <highlight>SOTE token balance</highlight> should be 0.
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BigNumber } from 'bignumber.js'

export default {
  name: 'MemberWithdraw',
  components:{},
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member'
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
    }
  },
  created(){
  },
  methods: {
    async initContract(){
    },
  }
}
</script>

<style lang="scss" scoped>
.important {
  color: #F56C6C;
}

#member-withdraw{
  .box-card{
    height: 300px;
  }
  .normal-text{
    line-height: 35px;
  }
  .icon-name{
    margin-right: 15px;
  }
  .green{
    color: #67C23A;
  }
}
</style>
