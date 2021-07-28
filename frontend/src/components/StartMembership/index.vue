<template>
  <div v-if="!member.isMember">
    <el-card class="box-card mb20">
      <el-row class="normal-text" style="flex-wrap: wrap;" type="flex" justify="space-between" align="middle">
        <el-col :xs="24" :sm="24" :md="24" :lg="18" class="tip">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          This address is not a member. Please make sure you have the correct address connected, or become a member.
        </el-col>
        <el-button round @click="toMembership" type="primary">Start Membership Process</el-button>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'LiStartMembership',
  data() {

    return {}
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
  },
  methods: {
    toMembership() {
      this.$router.replace("/start/member");
    }
  }
}
</script>

<style lang="scss" scoped>
.tip {
  line-height: 24px;
  margin-bottom: 16px;
  .icon {
    margin-right: 10px;
  }
}

@media only screen and (min-width: 1200px) {
  .tip {
    margin-bottom: 0;
  }
}
</style>
