<template>
  <div id="stake-stake-selected-selected" class="secondary-text">
    <div v-for="(project, index) in options.selectedProject">
      <img :src="project.icon" class="project-list-icon" />
      <span>{{project.name}}</span>
      <i class="el-icon-delete" v-if="project.stakedStatus != 'staked'" @click="options.selectedProject.splice(index, 1)"/>
    </div>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
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
#stake-stake-selected-selected{
    .icon-name {
      vertical-align: middle;
      margin-right: 15px;
    }
    line-height: 35px;
    i {
      float: right;
      cursor: pointer;
      vertical-align: middle;
      line-height: 35px;
    }
    i:hover{
      color: $--color-primary;
    }
}
</style>
