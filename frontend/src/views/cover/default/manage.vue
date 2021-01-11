<template>
  <div id="cover-manage">
    <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Covers" name="activeCovers">
        <ActiveCovers :options="options" />
      </el-tab-pane>
      <!-- <el-tab-pane label="Inactive Covers" name="inactiveCovers">
          Inactive Covers
      </el-tab-pane> -->
      <el-tab-pane label="Claims" name="claims">
        <claims :options="options" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ActiveCovers from './activeCovers';
import claims from './claims';

export default {
  name: "Manage",
  components:{
    ActiveCovers, claims
  },
  data() {
    return {
      activeName: "activeCovers",
      options: {
        claims: [],
      }
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
    handleClick(){

    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-manage{

}
</style>
