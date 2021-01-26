<template>
  <div id="gov-proposal-vote" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-alert
        v-if="canCloseProposal"
        title="Voting period's already expired, and any member is allowed to close the voting process immediately."
        type="warning"
        show-icon
        :closable="false"
        effect="dark">
    </el-alert>
    <br/>
    <el-form ref="voteFrm" :model="form" label-position="left" label-width="120px" :disabled="!member.isMember">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status">
            {{options.formatters.status[options.active.status]}}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-button round v-if="canCloseProposal" type="primary" size="small" @click="closeVoting" style="float: right;">Close Voting Process</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Last Updated" prop="created">
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
      <el-row>
        <el-col :span="24">
          <el-form-item label="Description">
            <div class="secondary-text tip">
              {{options.active.desc}}
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Parameters">
            <div class="secondary-text params">On acceptance of this proposal, automatic action shall be triggered with the following parameters</div>
          </el-form-item>
          <el-table
            :data="category.params"
            highlight-current-row
            row-class-name="role-row"
            style="width: 100%">
            <el-table-column
              property="name"
              label="Name"
              width="120">
            </el-table-column>
            <el-table-column
              property="type"
              label="Type"
              width="80">
            </el-table-column>
            <el-table-column
              property="desc"
              label="Description">
            </el-table-column>
            <el-table-column
              label="Value">
              <template slot-scope="scope">
                {{options.paramValues[scope.$index]}}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <br />
      <el-row v-if="!canCloseProposal">
        <el-col :span="24">
          <div style="float: right;">
            <el-button round size="small" @click="vote(0)">Reject</el-button>
            <el-button round type="primary" size="small" @click="vote(1)">Accept</el-button>
          </div>
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
import { BigNumber } from 'bignumber.js';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      form:{
      },
      Governance: null,
      loading: false,
      canCloseProposal: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
    isNotOwner(){
      return false;
    },
    category(){
      const category = this.options.formatters.categories.find(item => item.index == this.options.active.category);
      console.info(category);
      return category;
    },
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
      this.canClose();
    },
    formatCategory(){
      const category = this.options.formatters.categories.find(item => item.index == this.options.active.category);
      return category ? category.name : "Uncategorized";
    },
    canClose(){
      this.canCloseProposal = false;
      const instance = this.Governance.getContract().instance;
      const id = this.options.active.id;
      instance.canCloseProposal(id).then(res => {
        this.canCloseProposal = BigNumber(res.toString()).eq(1);
      });
    },
    closeVoting(){
      this.loading = true;
      const id = this.options.active.id;
      const instance = this.Governance.getContract().instance;
      instance.closeProposal(id, { from: this.member.account }).then(res => {
        this.$message.success("Close proposal successfully.");
        this.$Bus.$emit("refresh:proposals", id);
      }).catch(e => {
        console.error(e);
        this.$message.error(e.message);
      }).finally(() => {
        this.loading = false;
      });
    },
    vote(param){
      this.loading = true;
      const instance = this.Governance.getContract().instance;
      const id = this.options.active.id;
      instance.submitVote(id, param.toString(), { from: this.member.account }).then(res => {
        console.info(res, res.toString());
        this.$message.success(`You had ${param==1 ? 'accepted' : 'rejected'} this proposal.`);
        this.$Bus.$emit("refresh:proposals", id);
      }).catch(e => {
        console.error(e);
        this.$message.error(e.message);
      }).finally(() => {
        this.loading = false;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#gov-proposal-vote{
  .tip{
    font-weight: bold;
  }
}
</style>
