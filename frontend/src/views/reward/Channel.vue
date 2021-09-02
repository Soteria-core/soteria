<template>
  <div class="channel">
    <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
      <el-col :xs="24" :sm="24" :md="8" class="mb20">
        <el-card class="item box-card">
          <div class="item-info">
            <div class="name">STAKING</div>
            <div class="balance">{{$etherToNumber(rewards[0])}} SOTE</div>
            <div>Earn rewards by staking on contracts you think are secure. </div>
          </div>
          <el-button type="primary" plain round @click="toStake">Stake</el-button>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" class="mb20">
        <el-card class="item box-card">
          <div class="item-info">
            <div class="name">CLAIM ASSESSMENT</div>
            <div class="balance">{{$etherToNumber(rewards[1])}} SOTE</div>
            <div>Earn rewards by assessing claims. </div>
          </div>
          <el-button type="primary" plain round @click="viewOpenClaims">View open claims</el-button>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" class="mb20">
        <el-card class="item box-card">
          <div class="item-info">
            <div class="name">GOVERNANCE</div>
            <div class="balance">{{$etherToNumber(rewards[2])}} SOTE</div>
            <div>Earn rewards by voting in governance. </div>
          </div>
          <el-button type="primary" plain round @click="vote">Vote</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'Channel',
  props: ['rewards'],
  computed: {
    ...mapGetters(['settings']),
  },
  methods: {
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
