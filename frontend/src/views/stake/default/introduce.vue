<template>
  <div id="stake-introduce">
    <el-row :gutter="20">
      <el-col v-for="introduce in introduces" :span="8" style="margin-bottom: 20px;">
        <el-card class="box-card">
          <div style="line-height: 40px;text-align: center;">
            <svg-icon :icon-class="introduce.icon" class="icon-name"></svg-icon>
          </div>
          <span class="secondary-text">
            {{introduce.content}}
          </span>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import introduces from './introduces.json';

export default {
  components:{
  },
  data() {
    return {
      introduces: introduces,
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
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.icon-name {
  width: 40px;
  height: 40px;
  vertical-align: middle;
  margin-bottom: 20px;
}
.box-card{
  line-height: 24px;
  height: 200px;
}
</style>
