<template>
  <div class="app-container" id="gov">
    <StartMembership/>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="Proposal" name="proposal">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" class="mb20">
            <ProposalList :options="options" />
          </el-col>
          <el-col :xs="24" :sm="24" :md="12">
            <ProposalDetail :options="options" />
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Category" name="category">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="8" class="mb20">
            <CategoryList :options="options" />
          </el-col>
          <el-col :xs="24" :sm="24" :md="16">
            <CategoryDetail :options="options" />
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Roles" name="roles">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="8" class="mb20">
            <RoleList :options="options" />
          </el-col>
          <el-col :xs="24" :sm="24" :md="16">
            <RoleDetail :options="options" />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ProposalList from './proposalList'
import CategoryList from './categoryList'
import RoleList from './roleList'
import CategoryDetail from './categoryDetail'
import ProposalDetail from './proposalDetail'
import RoleDetail from './roleDetail'
import MemberRolesContract from '@/services/MemberRoles';
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

export default {
  filters: {

  },
  components: { ProposalList, CategoryList, CategoryDetail, ProposalDetail, RoleList, RoleDetail },
  data() {
    return {
      activeName: "proposal",
      MemberRoles: null,
      options: {
        activeProposal: "2",
        activeCategory: "2",
        activeRole: {},
        formatters: {},
        curRoles: [],
        paramValues: [],
      }
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ])
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
      this.MemberRoles = await this.getContract(MemberRolesContract);
      this.loadMemberRoles();
    },
    loadMemberRoles(){
      if (!this.member.account) {
        return
      }
      const instance = this.MemberRoles.getContract().instance;
      this.options.curRoles = [];
      instance.roles(this.member.account).then(res => {
        res.forEach(item => {
          this.options.curRoles.push(item.toString());
        });
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
    },
    handleClick(){
      // if(this.activeName == "roles"){
      //   this.options.activeRole = {};
      // }else{
      //   this.options.activeProposal = "2";
      //   this.options.activeCategory = "2";
      // }
    }
  }
}
</script>

<style lang="scss" scoped>
#gov{
  .el-form-item{
    margin-bottom: 5px !important;
  }
}
</style>
<style lang="scss">
#gov{
  .el-form-item{
    margin-bottom: 5px !important;
  }
}
</style>
