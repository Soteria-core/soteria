<template>
  <div id="gov-proposal-vote-view" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-alert
        v-if="canCloseProposal"
        title="Voting period's already expired, and any member is allowed to close the voting process immediately."
        type="warning"
        show-icon
        :closable="false"
        effect="dark">
    </el-alert>
    <el-alert
        v-if="options.active.status == 3 && actionStatus == 1"
        :title="`The proposal action was accepted, and any member is allowed to trigger it after ${$secondsToDateString(proposalExecutionTime, 'DD/MM/YYYY HH:mm:SS')}.`"
        type="warning"
        show-icon
        :closable="false"
        effect="dark">
    </el-alert>
    <el-alert
        v-if="actionStatus == 3"
        :title="`The proposal action was executed.`"
        type="warning"
        show-icon
        :closable="false"
        effect="dark">
    </el-alert>
    <br/>
    <el-form ref="voteFrm" :model="form" label-width="120px" label-position="left" :disabled="!member.isMember">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status">
            {{options.formatters.status[options.active.status]}}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-button round v-if="canCloseProposal" type="primary" size="small" @click="closeVoting" style="float: right;">Close Voting Process</el-button>
            <el-button round v-if="canExecutionProposal" type="primary" size="small" @click="execProposal" style="float: right;">Trigger Action</el-button>
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
          <el-form-item label="Quorum Progress" label-width="200px">
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <LiVoteChart :title="'Member ' + quorumProgress + '%'" showLabel="none" :left="quorumProgress" :center="0" :right="UnQuorumProgress" :target="quorumPerc + '%'"></LiVoteChart>
        </el-col>
      </el-row>
      <br />
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
      <el-divider></el-divider>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Advisory Board Recommendation" label-width="260px">
            <el-tag type="success" v-if="abAccept">Accept</el-tag>
            <el-tag type="danger" v-else>Reject</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <LiVoteChart title="Advisory Board Support" :left="abAccepted" :center="abRejected" :right="abUnVoted" :target="categoryABReq + '%'"></LiVoteChart>
        </el-col>
      </el-row>
      <br/>
      <el-row>
        <el-col :span="24">
          <LiVoteChart title="Current Member Support" showLabel="noVoted" :left="memberAcceptedWeight" :center="memberRejectedWeight" :right="0" :target="majorityVotePerc + '%'"></LiVoteChart>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Action Execution" label-width="200">
          </el-form-item>
          <div class="secondary-text">
            Action to executed <highlight>{{category.method}}({{params}})</highlight> in contract <highlight>{{category.contractName}}</highlight>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Action Status" label-width="200">
            <highlight class="secondary-text">{{actionStatusString[actionStatus]}}.</highlight>
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
import MemberRolesContract from '@/services/MemberRoles';
import ProposalCategoryContract from '@/services/ProposalCategory';
import SOTETokenContract from '@/services/SOTEToken';
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
      ProposalCategory: null,
      MemberRoles: null,
      SOTEToken: null,
      loading: false,
      abAccepted: 0,
      abRejected: 0,
      abUnVoted: 0,
      abCount: 0,
      memberAccepted: 0,
      memberRejected: 0,
      memberAcceptedWeight: 0,
      memberRejectedWeight: 0,
      members: 0,

      majorityVotePerc: 0,
      categoryABReq: 0,
      quorumPerc: 0,

      totalSOTE: 0,

      canCloseProposal: false,
      canExecutionProposal: false,
      proposalExecutionTime: 0,
      actionStatus: 0,
      actionStatusString: [
        "Pending",
        "Accepted",
        "Rejected",
        "Executed",
        "No Action"
      ]
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
    category(){
      return this.options.formatters.categories.find(item => item.index == this.options.active.category);
    },
    params(){
      return this.category && this.category.params ? this.category.params.map(item => item.type).join(", ") : "";
    },
    isAccepted(){
      return this.options.active.status==3 || this.options.active.status==5
    },
    abAccept(){
      return BigNumber(this.abAccepted).gt(this.abRejected);
    },
    quorumProgress(){
      const a = BigNumber(this.memberAcceptedWeight).plus(this.memberRejectedWeight).times(100);
      const b = BigNumber(this.totalSOTE).plus(this.$ether(this.members.toString()).toString());
      return a.div(b).toFixed(2, 1);
    },
    UnQuorumProgress(){
      return BigNumber(100).minus(this.quorumProgress);
    },
  },
  watch: {
    web3Status: watch.web3Status,
    "options.active": {
      handler(newVal){
        if(newVal){
          this.initData();
        }
      },
      deep: true,
    },
  },
  created(){
    this.initData();
    this.$Bus.unbindEvent(this.$EventNames.switchAccount, this._uid);
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
      if(!this.MemberRoles) this.MemberRoles = await this.getContract(MemberRolesContract);
      if(!this.ProposalCategory) this.ProposalCategory = await this.getContract(ProposalCategoryContract);
      if(!this.SOTEToken) this.SOTEToken = await this.getContract(SOTETokenContract);
      this.getData();
      this.getCategory();
      this.geTotalSOTE();
      this.canClose();
      this.canExecution();
    },
    formatCategory(){
      const category = this.options.formatters.categories.find(item => item.index == this.options.active.category);
      return category ? category.name : "Uncategorized";
    },
    async getData(){
      const [rejected, accepted, abCount, memberCount] = await Promise.all([
        this.getVoteData(0), this.getVoteData(1), this.getMemberCount(1),
        this.getMemberCount(2)
      ]);
      this.abAccepted = accepted[1].toString();
      this.abRejected = rejected[1].toString();
      this.abUnVoted = parseInt(abCount.toString()) - parseInt(this.abAccepted) - parseInt(this.abRejected);
      this.abCount = abCount.toString();
      this.members = memberCount.toString();
      this.memberAccepted = accepted[2].toString();
      this.memberRejected = rejected[2].toString();
      this.memberAcceptedWeight = accepted[0].toString();
      this.memberRejectedWeight = rejected[0].toString();
    },
    async getVoteData(vote){
      const instance = this.Governance.getContract().instance;
      const id = this.options.active.id;
      try{
        return await instance.voteTallyData(id, vote);
      }catch(e){
        console.error(e);
        this.$message.error(e.message);
      }finally{
      };
    },
    async getMemberCount(role){
      const instance = this.MemberRoles.getContract().instance;
      try{
        return await instance.membersLength(role);
      }catch(e){
        console.error(e);
        this.$message.error(e.message);
      }finally{
      };
    },
    async getCategory(){
      const instance = this.ProposalCategory.getContract().instance;
      const id = this.options.active.category;
      instance.category(id).then(res => {
        this.majorityVotePerc = res[2].toString();
        this.quorumPerc = res[3].toString();
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
      instance.categoryExtendedData(id).then(res => {
        this.categoryABReq = res[1].toString();
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
    },
    async geTotalSOTE(){
      const instance = this.SOTEToken.getContract().instance;
      instance.totalSupply().then(res => {
        this.totalSOTE = res.toString();
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
    },
    canClose(){
      this.canCloseProposal = false;
      if(this.options.active.status != 2){
        return;
      }
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
    async canExecution(){
      this.canExecutionProposal = false;

      const instance = this.Governance.getContract().instance;
      const id = this.options.active.id;
      try{
        const actionStatus = await instance.proposalActionStatus(id);
        this.actionStatus = actionStatus;
        if(!BigNumber(actionStatus.toString()).eq(1)){
          // 只有accepted状态才需要执行提案
          return;
        }
      }catch(e){
        this.$message.error(e.message);
        console.info(e);
      }
      if(this.options.active.status != 3){
        return;
      }

      instance.proposalExecutionTime(id).then(res => {
        this.proposalExecutionTime = res.toString();
        const curTime = new Date().getTime()/1000;
        console.info(this.proposalExecutionTime, curTime);
        this.canExecutionProposal = BigNumber(this.proposalExecutionTime).lte(curTime);
      });
    },
    execProposal(){
      this.loading = true;
      const id = this.options.active.id;
      const instance = this.Governance.getContract().instance;
      instance.triggerAction(id, { from: this.member.account }).then(res => {
        console.info(res, res.toString());
        this.$message.success("Execute proposal successfully.");
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
#gov-proposal-vote-view{
  .tip{
    font-weight: bold;
  }
}
</style>
