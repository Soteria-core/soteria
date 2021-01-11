<template>
  <div id="stake-stats-overall">
    <el-card class="box-card">
      <el-form :disabled="!member.isMember">
        <el-row>
          <h2 class="main-text">Staking Stats</h2>
          <span class="normal-text">Staking statistics for coverable projects.</span>
          <span class="right-area">
            <el-button type="primary" plain round @click="back">Back</el-button>
            <el-button type="primary" round @click="staking">Start staking</el-button>
          </span>
        </el-row>
        <br />
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

export default {
  name: "Overall",
  components:{
  },
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
    staking(){
      this.$router.push("/system/stake/stake");
    },
    back(){
      this.$router.go(-1);
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-stats-overall{

}
</style>
