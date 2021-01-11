<template>
  <div v-if="!member.isMember">
    <el-card class="box-card">
        <div class="tip normal-text">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          This address is not a member. Please make sure you have the correct address connected, or become a member.
          <el-button round @click="toMembership" type="primary" style="float: right;">Start Membership Process</el-button>
        </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'LiStartMembership',
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
  methods: {
    toMembership(){
      this.$router.replace("/start/member");
    }
  }
}
</script>

<style lang="scss" scoped>
.tip{
  line-height: 60px;
  .el-button {
    float: right;
    position: relative;
    top: 10px;
  }
}
.icon{
  margin-right: 10px;
}
.box-card{
  margin-bottom: 20px;
}
</style>
