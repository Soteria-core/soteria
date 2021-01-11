<template>
  <el-card class="box-card">
    <el-table
      :data="options.selectedProject"
      stripe
      style="width: 100%">
      <el-table-column
        prop="name"
        label="PROJECT">
        <template slot-scope="scope">
          <img :src="scope.row.icon" class="project-list-icon" />
          {{scope.row.name}}
        </template>
      </el-table-column>
      <el-table-column
        prop="stake"
        label="ADD">
        <template slot-scope="scope">
          <el-input size="mini" style="width:180px;" disabled v-model="scope.row.stake" class="right-input">
            <template slot="append">SOTE</template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="stake"
        label="STAKE">
        <template slot-scope="scope">
          {{staked(scope.row)}} SOTE
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        label="OPTIONS">
        <template slot-scope="scope">
          
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <div style="text-align: center;">
        <el-button type="text" @click="addMore">Add more projects</el-button>
      </div>
    </el-row>
  </el-card>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

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
    addMore(){
      this.$emit("addMore");
    },
    staked(row){
      return BigNumber(row.stake).plus(row.ownerStaked).toFixed(2, 1);
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';

</style>
<style lang="scss">

</style>
