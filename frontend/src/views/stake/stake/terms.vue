<template>
  <div id="stake-stake-terms">
    <el-row>
      <el-col v-for="term in terms" :span="24" style="margin-bottom: 20px;">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <highlight>{{term.title}}</highlight>
          </div>
          <span class="secondary-text">
            {{term.content}}
          </span>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import terms from './terms.json';

export default {
  components:{
  },
  data() {
    return {
      terms: terms
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
#stake-stake-terms{
  .secondary-text{
    line-height: 35px;
  }
}
</style>
