<template>
  <div id="gov-category-detail">
    <el-card class="box-card">
      <div slot="header">
        <h2 class="main-text">{{options.activeCategory.name}}</h2>
        <div class="normal-text">{{options.activeCategory.description}}</div>
      </div>
      <el-divider content-position="left">
        <h4>Details</h4>
      </el-divider>
      <el-row class="section">
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="20" :md="16" class="title">Role allowed to vote:</el-col>
            <el-col :xs="24" :sm="4" :md="8" class="content">{{roles[parseInt(detail.memberRoleToVote)]}}</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="20" :md="16" class="title">Vote percent required for accepting the solution:</el-col>
            <el-col :xs="24" :sm="4" :md="8" class="content">{{detail.majorityVotePerc}}</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="20" :md="16" class="title">Threshold percentage of voters:</el-col>
            <el-col :xs="24" :sm="4" :md="8" class="content">{{detail.quorumPerc}}</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="20" :md="16" class="title">Role allowed to create proposal:</el-col>
            <el-col :xs="24" :sm="4" :md="8" class="content">{{formatAllowedToCreateProposal()}}</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="20" :md="16" class="title">Period of time for which voting process continues:</el-col>
            <el-col :xs="24" :sm="4" :md="8" class="content">{{detail.closingTime/60/60/24}} days</el-col>
          </el-row>
        </el-col>
        <el-col>
          <el-row>
            <el-col :xs="24" :sm="20" :md="16" class="title">Minimum numbers of tokens to be locked before creating proposal:</el-col>
            <el-col :xs="24" :sm="4" :md="8" class="content">{{detail.minStake}}</el-col>
          </el-row>
        </el-col>
      </el-row>

<!--      <el-form label-width="500px" label-position="left">-->
<!--        <el-form-item label="Role allowed to vote:">-->
<!--          {{roles[parseInt(detail.memberRoleToVote)]}}-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Vote percent required for accepting the solution:">-->
<!--          {{detail.majorityVotePerc}}-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Threshold percentage of voters:">-->
<!--          {{detail.quorumPerc}}-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Role allowed to create proposal:">-->
<!--          {{formatAllowedToCreateProposal()}}-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Period of time for which voting process continues:">-->
<!--          {{detail.closingTime/60/60/24}} days-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Minimum numbers of tokens to be locked before creating proposal:">-->
<!--          {{detail.minStake}}-->
<!--        </el-form-item>-->
<!--      </el-form>-->
      <el-divider content-position="left">
        <h4>Extended Data</h4>
      </el-divider>
      <el-row class="section">
        <el-col :xs="24" :sm="10" :lg="7" class="title">Advisory Board Majority Vote:</el-col>
        <el-col :xs="24" :sm="14" :lg="17" class="content">{{extended.categoryABReq}}</el-col>
      </el-row>
<!--      <el-form label-width="240px" label-position="left">-->
<!--        <el-form-item label="Advisory Board Majority Vote:">-->
<!--          {{extended.categoryABReq}}-->
<!--        </el-form-item>-->
<!--      </el-form>-->

      <el-divider content-position="left">
        <h4>On-Chain Action To Be Triggered If Proposal Passed</h4>
      </el-divider>
      <el-row class="section">
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="6" :lg="5" class="title">Contract Name:</el-col>
            <el-col :xs="24" :sm="18" :lg="19" class="content">{{options.activeCategory.contractName}}</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="6" :lg="5" class="title">Default Incentive:</el-col>
            <el-col :xs="24" :sm="18" :lg="19" class="content">{{action.defaultIncentive}}</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="6" :lg="5" class="title">Function:</el-col>
            <el-col :xs="24" :sm="18" :lg="19" class="content">{{options.activeCategory.method}}({{params}})</el-col>
          </el-row>
        </el-col>
        <el-col class="mb8">
          <el-row>
            <el-col :xs="24" :sm="6" :lg="5" class="title">Parameter:</el-col>
            <el-col :xs="24" :sm="18" :lg="19" class="content">
              <el-table
                :data="options.activeCategory.params"
                highlight-current-row
                row-class-name="role-row"
                style="width: 100%">
                <el-table-column
                  type="index"
                  min-width="60"
                  label="Index">
                </el-table-column>
                <el-table-column
                  property="type"
                  label="Type">
                </el-table-column>
                <el-table-column
                  property="desc"
                  label="Description">
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ProposalCategoryContract from '@/services/ProposalCategory';

export default {
  filters: {

  },
  components: { },
  props: ["options"],
  data() {
    return {
      members: [],
      ProposalCategory: null,
      detail: {},
      extended: {},
      action: {},
      detailColumns: ["id", "memberRoleToVote", "majorityVotePerc", "quorumPerc", "allowedToCreateProposal", "closingTime", "minStake"],
      extendedColumns: ["id", "categoryABReq", "isSpecialResolution"],
      actionColumns: ["id", "contractAddress", "contractName", "defaultIncentive", "categoryActionHashes"],
      roles: ["UnAssigned", "AdvisoryBoard", "Member", "Owner"]
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
    params(){
      return this.options.activeCategory && this.options.activeCategory.params ? this.options.activeCategory.params.map(item => item.type).join(", ") : "";
    }
  },
  watch: {
    web3Status: watch.web3Status,
    "options.activeCategory": {
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
      if(!this.ProposalCategory) this.ProposalCategory = await this.getContract(ProposalCategoryContract);
      this.loadCategoryDetail();
    },
    loadCategoryDetail(){
      const instance = this.ProposalCategory.getContract().instance;

      if(this.options.activeCategory.index){
        console.info(this.options.activeCategory.index);
        instance.category(this.options.activeCategory.index).then(res => {
          this.convertData("detail", "detailColumns", res);
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
        instance.categoryExtendedData(this.options.activeCategory.index).then(res => {
          this.convertData("extended", "extendedColumns", res);
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
        instance.categoryActionDetails(this.options.activeCategory.index).then(res => {
          this.convertData("action", "actionColumns", res);
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
      }
    },
    formatAllowedToCreateProposal(){
      return this.detail.allowedToCreateProposal ? this.detail.allowedToCreateProposal.map(item => this.roles[parseInt(item)]).join(", ") : "N/A";
    },
    convertData(target, columns, value){
      if(value){
        for(let prop in value){
          const item = value[prop];
          if(item instanceof Array){
            this[target][this.[columns][parseInt(prop)]] = item.map(obj => obj.toString());
          }else{
            this[target][this.[columns][parseInt(prop)]] = item.toString();
          }
        }
        this.$forceUpdate();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#gov-category-detail{
  height: calc(100vh - 146px);
  .box-card{
    height: calc(100%);
  }
  .el-form-item {
    margin: 0px;
  }
}
</style>
<style lang="scss">
#gov-category-detail{
  .section {
    padding-bottom: 16px;
    .title {
      display: inline-block;
      padding: 8px 0;
      text-align: left;
      font-weight: 700;
      color: #606266;
    }
    .content {
      display: inline-block;
      padding: 8px 0;
    }
  }

  .box-card{
    .el-card__body{
      height: calc(100% - 110px);
      overflow-y: auto;
    }
  }
}
</style>
