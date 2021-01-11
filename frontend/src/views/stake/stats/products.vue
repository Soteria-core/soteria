<template>
  <div id="stake-stats-products">
    <el-card class="box-card">
      <el-table
        :data="products"
        stripe
        style="width: 100%">
        <el-table-column
          prop="project"
          label="PROJECT"
          width="280">
          <template slot-scope="scope">
            <i class="el-icon-platform-eleme"/>
            {{scope.row.project}}
          </template>
        </el-table-column>
        <el-table-column
          prop="apy"
          label="APY*">
        </el-table-column>
        <el-table-column
          prop="coverPrice"
          label="COVER PRICE*">
        </el-table-column>
        <el-table-column
          prop="totleStake"
          label="TOTAL STAKE">
          <template slot-scope="scope">
            {{scope.row.totleStake}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="netStake"
          label="NET STAKE*">
          <template slot-scope="scope">
            {{scope.row.netStake}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="capacity"
          label="CAPACITY">
          <template slot-scope="scope">
            <span v-if="scope.row.capacity>0">{{scope.row.capacity}} BNB</span>
            <el-link v-else type="primary" :underline="false">Needs staking</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { contracts } from '@/settings.js';
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import products from '@/views/stake/stats/products.json'

export default {
  components:{
  },
  data() {
    return {
      products: products,
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
}
</style>
