<template>
  <div id="gov-proposal-create" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-drawer
      title="Create Proposal"
      :visible.sync="options.showCreate"
      size="50%">
      <div class="create-drawer">
       <el-form name="createFrm" :model="form" label-width="180px" :rules="rules" ref="createFrm">
         <el-form-item label="Proposal Title" prop="title">
           <el-input v-model="form.title" placeholder="Enter a title for proposal"></el-input>
         </el-form-item>
         <el-form-item label="Proposal Description" prop="desc">
           <el-input type="textarea" :rows="5" v-model="form.desc" placeholder="Describe your proposal here"></el-input>
         </el-form-item>
       </el-form>
       <el-button round @click="$refs.createFrm.resetFields()">Reset</el-button>
       <el-button round type="primary" @click="createProposal">Submit</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import GovernanceContract from '@/services/Governance';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      form:{
        title: "",
        desc: ""
      },
      rules:{
        title: [{ required: true, trigger: 'blur', message: "Proposal title is category."}],
        desc: [{ required: true, trigger: 'blur', message: "Proposal description is category."}],
      },
      Governance: null,
      loading: false,
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
      if(!this.Governance) this.Governance = await this.getContract(GovernanceContract);
    },
    createProposal(){
      this.$refs.createFrm.validate(valid => {
        if(valid){
          this.loading = true;
          const instance = this.Governance.getContract().instance;
          instance.createProposal(this.form.title, this.form.desc, "", 0, { from: this.member.account }).then(res => {
            console.info(res, res.toString());
            this.$message.success("Create proposal successfully");
            this.options.showCreate = false;
            this.$emit("refresh");
          }).catch(e => {
            console.error(e);
            this.$message.error(e.message);
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#gov-proposal-create{
  .create-drawer{
    padding: 20px;
  }
}
</style>
