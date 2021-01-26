<template>
  <div id="gov-proposal-solution" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-alert
        :title="`Voting for this proposal has not started yet. Proposal owner ${options.active.owner} holds the right to open it for voting.`"
        type="warning"
        show-icon
        :closable="false"
        effect="dark">
    </el-alert>
    <br/>
    <el-form ref="solutionFrm" label-position="left" :model="form" label-width="120px" :disabled="isNotOwner">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status">
            {{options.formatters.status[options.active.status]}}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-button round type="primary" size="small" @click="submitSolution" style="float: right;">Submit</el-button>
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
          <el-form-item label="Category">
            {{formatCategory()}}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Incentive">
            {{$etherToNumber(options.active.commonIncentive)}} SOTE
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-for="(param, index) in this.category.params">
        <el-col :span="24">
          <el-form-item :label="'Parameter ' + (index+1)" :rules="isNotOwner ? [] : rules" :prop="'params[' + index + ']'">
            <el-input v-model="form.params[index]" placeholder="Enter a parameter value"></el-input>
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
import Web3 from 'web3';
import abi from 'ethereumjs-abi';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      form:{
        params: [],
      },
      rules: [{ required: true, trigger: 'blur', message: "Parameter value is required."}],
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
    isNotOwner(){
      return this.options.active.owner.toLowerCase() != this.member.account.toLowerCase();
    },
    category(){
      const category = this.options.formatters.categories.find(item => item.index == this.options.active.category);
      return category;
    }
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
    formatCategory(){
      return this.category ? this.category.name : "Uncategorized";
    },
    encode(...args){
      if (args.length === 1) {
        return '0x';
      }

      const [fn, ...params] = args;
      const types = fn
        .slice(0, fn.length - 1)
        .split('(')[1]
        .split(',');

      for (let i = 0; i < types.length; i++) {
        if (types[i].includes('bytes') && !params[i].startsWith('0x')) {
          params[i] = Web3.utils.toHex(params[i]);
        }
      }

      return this.encode1(types, params);
    },
    encode1(...args){
      const encoded = abi.rawEncode.apply(this, args);
      return '0x' + encoded.toString('hex');
    },
    submitSolution(){
      this.$refs.solutionFrm.validate(valid => {
        if(valid){
          this.loading = true;
          const instance = this.Governance.getContract().instance;
          const id = this.options.active.id;
          const solution = "proposal";
          const category = this.category;
          const method = category.method + "(" + category.params.map(item => item.type).join(",") + ")";
          const actionHash = this.encode(method, ...this.form.params);
          instance.submitProposalWithSolution(id, solution, actionHash, { from: this.member.account }).then(res => {
            console.info(res, res.toString());
            this.$message.success("Submit proposal with solution successfully");
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
#gov-proposal-solution{
  .tip{
    font-weight: bold;
  }
}
</style>
