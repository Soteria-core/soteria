<template>
  <div id="gov-proposal-draft" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-alert
        title="This proposal is uncategorized and has not been for a vote yet. Only Advisory Board can categorize a proposal."
        type="warning"
        show-icon
        :closable="false"
        effect="dark">
    </el-alert>
    <br/>
    <el-form ref="categoryFrm" label-position="left" :model="form" :rules="isNotAB ? {} : rules" label-width="120px" :disabled="isNotAB">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status">
            {{options.formatters.status[options.active.status]}}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-button round type="primary" size="small" @click="submitCategory" style="float: right;">Submit</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Created" prop="created">
            {{$secondsToDateString(options.active.dateUpd, "MMM DD, YYYY HH:mm:SS")}}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Category" prop="category">
            <el-select v-model="form.category" filterable placeholder="Uncategorized">
              <el-option :key="0" label="Uncategorized" :value="'0'"></el-option>
              <el-option
                v-for="item in options.formatters.categories"
                :key="item.index"
                :label="item.name"
                :value="item.index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Incentives" prop="incentives">
            <el-input-number :min="0" v-model="form.incentives" /> SOTE
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Description">
            <div class="secondary-text tip">
              {{options.active.desc}}
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
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
        category: null,
        incentives: 0
      },
      rules:{
        category: [{ required: true, trigger: 'change', validator: this.validatorCategory }],
        incentives: [{ required: true, trigger: 'blur', message: "Proposal incentives is required."}],
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
    ]),
    isNotAB(){
      return this.options.curRoles.filter(item => item == '1').length == 0;
    }
  },
  watch: {
    web3Status: watch.web3Status,
    "options.active": {
      handler(newVal){
        if(newVal){
          this.form.category = newVal.category;
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
      if(!this.Governance) this.Governance = await this.getContract(GovernanceContract);
    },
    validatorCategory(rule, value, callback){
      if(parseInt(value) == 0){
        callback(new Error("Proposal category is required."));
        return;
      }
      callback();
      return;
    },
    submitCategory(){
      this.$refs.categoryFrm.validate(valid => {
        if(valid){
          this.loading = true;
          const instance = this.Governance.getContract().instance;
          const id = this.options.active.id;
          const categoryId = this.form.category;
          const incentives = this.$ether(this.form.incentives.toString());
          instance.categorizeProposal(id, categoryId, incentives, { from: this.member.account }).then(res => {
            console.info(res, res.toString());
            this.$message.success("Categorize proposal successfully");
            this.$Bus.$emit("refresh:proposals", id);
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
#gov-proposal-draft{
  .tip{
    font-weight: bold;
  }
}
</style>
