<template>
  <div id="gov-role-detail">
    <el-card class="box-card">
      <div slot="header">
        <h2 class="main-text">{{options.active.name}}</h2>
        <div class="normal-text">{{options.active.description}}</div>
      </div>
      <el-table
        ref="membersTable"
        :data="members"
        highlight-current-row
        height="100%"
        style="width: 100%;">
        <el-table-column
          property="address"
          label="Address">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import MemberRolesContract from '@/services/MemberRoles';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      members: [],
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
  watch: {
    web3Status: watch.web3Status,
    "options.active": {
      handler(newVal){
        if(newVal){
          this.initData();
        }
      }
    }
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
      if(!this.MemberRoles) this.MemberRoles = await this.getContract(MemberRolesContract);
      this.loadMembers();
    },
    loadMembers(){
      const instance = this.MemberRoles.getContract().instance;
      if(this.options.active.id){
        instance.members(this.options.active.id).then(res => {
          if(res.memberArray){
            this.members = res.memberArray.map(item => { 
              return {address: item.toString()};
            });
          }
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#gov-role-detail{
  height: calc(100vh - 146px);
  .box-card{
    height: calc(100%);
  }
}
</style>
<style lang="scss">
#gov-role-detail{
  .box-card{
    .el-card__body{
      height: calc(100% - 110px);
    }
  }
}
</style>
