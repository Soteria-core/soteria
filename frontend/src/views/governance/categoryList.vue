<template>
  <div id="gov-category">
    <el-card class="box-card">
      <el-table
        ref="singleTable"
        :data="categories"
        highlight-current-row
        @current-change="handleSelect"
        row-class-name="role-row"
        height="100%"
        style="width: 100%">
        <el-table-column
          type="index"
          label="No.">
        </el-table-column>
        <el-table-column
          property="name"
          label="Name">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { getCategories } from '@/api/gov.js';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      categories: [],
      MemberRoles: null,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ])
  },
  created(){
    this.initData();
  },
  methods: {
    initData(){
      this.loadCategories();
    },
    loadCategories(){
      getCategories().then(res => {
        this.categories = res.data;
        this.$refs.singleTable.setCurrentRow(this.categories[0]);
        this.options.activeCategory = this.categories[0];
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
    },
    handleSelect(row){
      this.options.activeCategory = row;
    }
  }
}
</script>

<style lang="scss" scoped>
#gov-category{
  height: calc(100vh - 146px);
  text-align: center;
  .box-card{
    height: 100%;
  }
  .createBtn{
    width: 80%;
    margin-bottom: 10px;
    position: relative;
  }
}
</style>
<style lang="scss">
#gov-category{
  .box-card{
    .el-card__body{
      height: 100%;
      .category-menu{
        text-align: left;
        height: calc(100% - 43px);
        overflow-y: auto;
        border-right: 0px !important;
        .el-menu-item{
          height: 40px;
          line-height: 40px;
        }
      }
    }
  }
}
</style>
