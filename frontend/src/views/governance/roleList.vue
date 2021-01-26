<template>
  <div id="gov-role">
    <el-card class="box-card">
      <el-table
        ref="singleTable"
        :data="roles"
        highlight-current-row
        @current-change="handleSelect"
        row-class-name="role-row"
        style="width: 100%">
        <el-table-column
          property="name"
          label="Role Name">
          <template slot-scope="scope">
            {{scope.row.name}}
            <i v-if="scope.row.isCurrent" class="el-icon-circle-check current-row"></i>
          </template>
        </el-table-column>
        <el-table-column
          property="members"
          label="No. of members"
          width="150">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import roles from './roles.json';
import MemberRolesContract from '@/services/MemberRoles';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      roles: roles,
      MemberRoles: null,
      curRoleId: 0,
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
      this.$nextTick(() => {
        this.$refs.singleTable.setCurrentRow(this.roles[0]);
        this.options.active = this.roles[0];
      });
    },
    async initContract(){
      this.MemberRoles = await this.getContract(MemberRolesContract);
      this.loadMembersOfRole();
    },
    loadMembersOfRole(){
      const instance = this.MemberRoles.getContract().instance;
      this.roles.forEach(role => {
        instance.membersLength(role.id).then(res => {
          role.members = res.toString();
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
      });
      instance.roles(this.member.account).then(res => {
        res.forEach(item => {
          const role = this.roles.find(role => role.id == item.toString());
          if(role) role.isCurrent = true;
        });
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
    },
    handleSelect(row){
      this.options.active = row;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#gov-role{
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
  .role-row{
    cursor: pointer;
  }
  .current-row{
    color: $--color-primary;
    height: 20px;
    width: 20px;
    margin-left: 10px;
    font-weight: bold;
  }
}
</style>
<style lang="scss">
#gov-role{
  
}
</style>
