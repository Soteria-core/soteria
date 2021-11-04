<template>
  <div
    id="reward"
    class="app-container"
    v-loading.fullscreen.lock="loading"
    element-loading-text="Transaction is confirming ...">
    <el-card class="box-card" v-if="actRewards.length">
      <h2 class="row sb cy">
        Activity Rewards
        <span class="toggle-btn secondary-text" :class="{'expand': expand}" @click="expand=!expand">
          <i class="el-icon-arrow-down"></i>{{ expand ? 'Put away' : 'Open up' }}
        </span>
      </h2>
      <el-row type="flex" justify="space-between" align="middle" class="activity wrap">
        <el-col :xs="24" :sm="24" :md="16" :class="{'mb16': device === 'mobile'}" class="list lh24" v-if="expand">
          <div class="item" v-for="item in actRewards" :key="item.contract">
            <span class="item-amount">{{ $etherToNumber(item.amount) }}</span>
            <span>{{ item.tokenName }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="16" :class="{'mb16': device === 'mobile'}" class="lh24">
          You currently have ${{actTotalRewardUsd}} worth of rewards to be claimed
        </el-col>
        <div class="right-area">
          <el-button
            type="primary"
            round
            class="withdraw-btn"
            @click="claimAllActRewards"
            :disabled="!Number(actTotalRewardUsd) || !member.account">Claim all</el-button>
        </div>
      </el-row>
    </el-card>
    <el-card class="box-card">
      <h2>Soteria Rewards</h2>
      <el-row type="flex" justify="space-between" align="middle" style="flex-wrap: wrap">
        <el-col :xs="24" :sm="24" :md="16" :class="{'mb16': device === 'mobile'}" class="lh24">
          You have {{$etherToNumber(totalRewards.toString())}} SOTE available
        </el-col>
        <div class="right-area">
          <el-button type="primary" round class="withdraw-btn" @click="withdrawAll" :disabled="!Number(totalRewards) || !member.account">Withdraw all</el-button>
        </div>
      </el-row>
    </el-card>
    <channel :rewards="rewards" />
  </div>
</template>

<script>
import { BigNumber } from 'bignumber.js'
import Channel from "@/views/reward/Channel";
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import {getRewardData, getActRewards} from "@/api/reward";
import ClaimsRewardContract from '@/services/ClaimsReward.js';
import AllMerkleDistributor from '@/services/AllMerkleDistributor.js';

export default {
  components: { Channel },
  data() {
    return {
      loading: false,
      ClaimsReward: null,
      AllMerkleDistributor: null,
      rewards: [],
      actRewards: [],
      actTotalRewardUsd: '0',
      totalRewards: 0,
      expand: false
    }
  },
  computed: {
    ...mapGetters(['device', 'web3Status', 'member']),
  },
  watch: {
    web3Status: watch.web3Status
  },
  created() {
    this.initData();
    this.$Bus.$on(this.$EventNames.refreshMember, (val)=>{
      this.initData(this);
    });
  },
  methods: {
    initData() {
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.ClaimsReward = await this.getContract(ClaimsRewardContract);
      // this.AllMerkleDistributor = await this.getContract(AllMerkleDistributor);
      // this.getActRewards()
      this.updateRewards()
    },
    async getActRewards() {
      const result = await getActRewards(this)
      if (!result) {
        return
      }
      const data = result.data.data || {};
      this.actRewards = data.list || []
      const origRewards = [];
      const merkleContracts = [];
      const indexs = []
      if (!this.actRewards.length) {
        return
      }
      this.actRewards.forEach(item => {
        if (item.amount !== '0') {
          merkleContracts.push(item.contract)
          indexs.push(item.index)
          origRewards.push(item.amount)
        }
        // 先全部显示0，等查询是否领取后再显示具体数值
        item.amount = '0'
      })
      this.actTotalRewardUsd = '0'
      const instance = this.AllMerkleDistributor.getContract().instance;
      instance.isClaimeds(merkleContracts, indexs).then(res => {
        let rewardSum = BigNumber(0);
        for (let i = 0; i < res.length; i++) {
          if (!res[i]) {
            // 未领取的显示具体数字
            let fi = 0;
            this.actRewards.forEach(item => {
              if (item.contract === merkleContracts[i]) {
                item.amount = origRewards[i]
                rewardSum = rewardSum.plus(BigNumber(data.rewardsUsd[fi]))
              }
              fi++
            })
          }
        }
        this.actTotalRewardUsd = rewardSum.toFixed(2);
      }).catch(e => {
        this.$message.error(e.message);
      });
    },
    async updateRewards(){
      this.rewards = await getRewardData(this);
      this.totalRewards = this.rewards.reduce((sum, item) => {
        return BigNumber(sum).plus(item.toString()).toString()
      }, '0')
    },
    claimAllActRewards() {
      if (!this.member.account) {
        return
      }
      const merkleContracts = []
      const indexs = []
      const amounts = []
      const merkleProofs = []
      this.actRewards.forEach(item => {
        if (item.amount !== '0') {
          merkleContracts.push(item.contract)
          indexs.push(item.index)
          amounts.push(item.amount)
          merkleProofs.push(item.proof)
        }
      })
      if (!merkleContracts.length) {
        return
      }
      this.loading = true;
      const instance = this.AllMerkleDistributor.getContract().instance;
      instance.claimAll(merkleContracts, indexs, amounts, merkleProofs, {from: this.member.account}).then(res => {
        this.$message.success("Collect all successfully.");
        this.actRewards.forEach(item => {
          item.amount = '0'
        })
        this.actTotalRewardUsd = '0'
        this.loading = false;
      }).catch(e => {
        this.$message.error(e.message);
        this.loading = false;
      });
    },
    withdrawAll(){
      if (!this.member.account) {
        return
      }
      this.loading = true;
      const instance = this.ClaimsReward.getContract().instance;
      instance.claimAllPendingReward(20, { from: this.member.account }).then(res => {
        this.$message.success("Withdraw all successfully.");
        this.updateRewards()
        this.loading = false;
      }).catch(e => {
        this.$message.error(e.message);
        this.loading = false;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
  #reward {
    .box-card {
      margin-bottom: 20px;
    }
    .withdraw-btn {
      width: 100%;
    }
    .activity {
      .list {
        margin-bottom: 8px;
        padding-left: 56px;
        font-weight: bold;
        font-size: 20px;
        color: #FC5653;
        .item {
          margin-bottom: 16px;
          &-amount {
            margin-right: 20px;
          }
        }
      }
    }
  }
</style>
