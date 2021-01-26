<template>
  <div id="gov-category-detail">
    <el-card class="box-card">
      <div slot="header">
        <h2 class="main-text">{{options.active.name}}</h2>
        <div class="normal-text">{{options.active.description}}</div>
      </div>
      <el-divider content-position="left">
        <h4>Details</h4>
      </el-divider>
      <el-form label-width="500px" label-position="left">
        <el-form-item label="Role allowed to vote:">
          {{roles[parseInt(detail.memberRoleToVote)]}}
        </el-form-item>
        <el-form-item label="Vote percent required for accepting the solution:">
          {{detail.majorityVotePerc}}
        </el-form-item>
        <el-form-item label="Threshold percentage of voters:">
          {{detail.quorumPerc}}
        </el-form-item>
        <el-form-item label="Role allowed to create proposal:">
          {{formatAllowedToCreateProposal()}}
        </el-form-item>
        <el-form-item label="Period of time for which voting process continues:">
          {{detail.closingTime/60/60/24}} days
        </el-form-item>
        <el-form-item label="Minimum numbers of tokens to be locked before creating proposal:">
          {{detail.minStake}}
        </el-form-item>
      </el-form>
      <el-divider content-position="left">
        <h4>Extended Data</h4>
      </el-divider>
      <el-form label-width="240px" label-position="left">
        <el-form-item label="Advisory Board Majority Vote:">
          {{extended.categoryABReq}}
        </el-form-item>
      </el-form>
      <el-divider content-position="left">
        <h4>On-Chain Action To Be Triggered If Proposal Passed</h4>
      </el-divider>
      <el-form label-width="180px" label-position="left">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Contract Name:">
              {{options.active.contractName}}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Default Incentive:">
              {{action.defaultIncentive}}
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Function:">
          {{options.active.method}}({{params}})
        </el-form-item>
        <el-form-item label="Parameter:">
          <el-table
            :data="options.active.params"
            highlight-current-row
            row-class-name="role-row"
            style="width: 100%">
            <el-table-column
              type="index"
              label="Index"
              width="100">
            </el-table-column>
            <el-table-column
              property="type"
              label="Type"
              width="180">
            </el-table-column>
            <el-table-column
              property="desc"
              label="Description">
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
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
      return this.options.active && this.options.active.params ? this.options.active.params.map(item => item.type).join(", ") : "";
    }
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
      if(!this.ProposalCategory) this.ProposalCategory = await this.getContract(ProposalCategoryContract);
      this.loadCategoryDetail();
    },
    loadCategoryDetail(){
      const instance = this.ProposalCategory.getContract().instance;

      if(this.options.active.index){
        console.info(this.options.active.index);
        instance.category(this.options.active.index).then(res => {
          this.convertData("detail", "detailColumns", res);
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
        instance.categoryExtendedData(this.options.active.index).then(res => {
          this.convertData("extended", "extendedColumns", res);
        }).catch(e => {
          this.$message.error(e.message);
          console.error(e);
        });
        instance.categoryActionDetails(this.options.active.index).then(res => {
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
@import '@/styles/element-variables.scss';
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
  .box-card{
    .el-card__body{
      height: calc(100% - 110px);
      overflow-y: auto;
    }
  }
}
</style>
