<template>
  <div class="channel">
    <el-row :gutter="20" type="flex" justify="space-between">
      <el-col :span="8">
        <el-card class="item box-card">
          <div class="item-info">
            <div class="name">STAKING</div>
            <div class="balance">{{$etherToNumber(rewards[0])}} SOTE</div>
            <div>Earn rewards by staking on contracts you think are secure. </div>
          </div>
          <el-button type="primary" plain round @click="toStake">Stake</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="item box-card">
          <div class="item-info">
            <div class="name">CLAIM ASSESSMENT</div>
            <div class="balance">{{$etherToNumber(rewards[1])}} SOTE</div>
            <div>Earn rewards by assessing claims. </div>
          </div>
          <el-button type="primary" plain round @click="viewOpenClaims">View open claims</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="item box-card">
          <div class="item-info">
            <div class="name">GOVERNANCE</div>
            <div class="balance">{{$etherToNumber(rewards[2])}} SOTE</div>
            <div>Earn rewards by voting in governance. </div>
          </div>
          <el-button type="primary" plain round @click="vote" :disabled="!settings.features.Governance">Vote</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {getRewardData} from "@/api/reward";
import {mapGetters} from "vuex";
import {watch} from "@/utils/watch";

export default {
  name: 'Channel',
  data() {
    return {
      rewards: [],
      onload: false,
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member', 'settings']),
  },
  watch: {
    web3Status: watch.web3Status,
    "member.isMember": {
      handler(newVal){
        if(newVal){
          this.initData();
        }
      }
    }
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, ()=>{
      this.initData();
    });
  },
  methods: {
    async initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        if(!this.onload){
          this.rewards = await getRewardData(this);
          if(this.rewards.filter(item => !item).length == 0){
            this.onload = true;
          }
          this.$emit("rewardsData", this.rewards);
        }
      }
    },
    toStake() {
      this.$router.push("/system/stake/default");
    },
    viewOpenClaims() {
      this.$router.push("/system/claim/default");
    },
    vote() {
      this.$router.push("/system/governance");
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/element-variables.scss';
  .channel {
    .item {
      &-info {
        padding-right: 40px;
        height: 160px;
        line-height: 24px;
        >.name {

        }
        >.balance {
          margin: 10px 0;
          font-size: 20px;
          font-weight: bold;
          color: $--color-primary;
        }
      }

      .el-button {
        width: 100%;
      }
    }
  }
</style>
