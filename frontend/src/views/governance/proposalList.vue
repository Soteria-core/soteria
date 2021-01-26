<template>
  <div id="gov-proposal" v-loading="loading"
        element-loading-text="Data loading ...">
    <el-card class="box-card">
      <el-button type="primary" class="createBtn" size="small" round @click="createOptions.showCreate = true;">Create Proposal</el-button>
      <div class="proposals">
        <div :class="{proposal: true, active: options.active.id == proposal.id}" v-for="proposal in proposals" @click="options.active=proposal">
          <div class="title">
            <highlight class="id secondary-text">#{{proposal.id}}</highlight>
            <highlight class="normal-text">{{proposal.title}}</highlight>
          </div>
          <div class="footer secondary-text">
            <span>
              <highlight>Status: </highlight> {{status[parseInt(proposal.status)]}}
            </span>
            <el-divider direction="vertical"></el-divider>
            <span>
              <highlight>Category: </highlight> {{formatCategory(proposal.category)}}
            </span>
          </div>
          <br/>
        </div>
      </div>
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :current-page="curPage"
          :total="count">
        </el-pagination>
      </div>
    </el-card>
    <ProposalCreate :options="createOptions" @refresh="refreshCreated" />
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import GovernanceContract from '@/services/Governance';
import { getCategories } from '@/api/gov.js';
import ProposalCreate from './proposalCreate';

export default {
  filters: {

  },
  components: { ProposalCreate },
  props: ["options"],
  data() {
    return {
      Governance: null,
      proposals: [],
      curProposalId: null,
      count: null,
      curId: 0,
      pageSize: 10,
      curPage: 1,
      latestLoadTime: null,
      dataLoading: false,
      loading: false,
      status: ["Draft",
        "Awaiting Solution",
        "Voting Started",
        "Accepted",
        "Rejected",
        "Majority Not Reached But Accepted",
        "Denied"],
      categories: [],
      createOptions: {
        showCreate: false
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
    this.$Bus.$on("refresh:proposals", (id) => {
      this.curProposalId = id;
      this.refresh();
    });
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  methods: {
    formatCategory(id){
      const category = this.categories.find(item => item.index == id);
      return category ? category.name : "Uncategorized";
    },
    initData(){
      this.options.formatters.status = this.status;
      this.loadCategories();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    loadCategories(){
      getCategories().then(res => {
        this.categories = res.data;
        this.options.formatters.categories = this.categories;
      }).catch(e => {
        this.$message.error(e.message);
        console.error(e);
      });
    },
    async initContract(){
      if(!this.Governance) this.Governance = await this.getContract(GovernanceContract);
      this.loadProposal();
    },
    async loadProposal(){
      this.proposals.splice(0, this.proposals.length);
      this.curId = 0;
      try{
        const instance = this.Governance.getContract().instance;
        const count = await instance.totalProposals();
        this.count = parseInt(count.toString()) - 1;
        this.getProposal(this.count, this.pageSize);
      }catch(e){
        console.info(e);
        this.$message.error(e.message);
      }
    },
    refreshCreated(){
      this.curProposalId = null;
      this.curPage = 1;
      this.loadProposal();
    },
    refresh(){
      this.curId = this.count - (this.curPage - 1) * this.pageSize;
      this.getProposal(this.curId, this.pageSize);
    },
    currentChange(page){
      this.curProposalId = null;
      this.options.active = {};
      this.curPage = page;
      this.curId = this.count - (page - 1) * this.pageSize;
      this.getProposal(this.curId, this.pageSize);
    },
    async getProposal(start, size){
      try{
        this.loading = true;
        // 加锁，数据加载中....
        this.dataLoading = true;
        this.proposals = [];
        if(start <= 0){
          return;
        }

        let curload = start;
        let loadCount = 0;

        const instance = this.Governance.getContract().instance;
        while(true){
          this.curId = curload;
          if(curload <= 0){
            // 所有数据加载完成了
            break;
          }
          if(loadCount >= size){
            // 本次数据加载完成了
            break;
          }
          // 读取数据
          const result = await instance.allProposalData(curload.toString());
          const proposal = {
            id: curload.toString(),
            title: result.title.toString(),
            desc: result.desc.toString(),
            category: result.category.toString(),
            owner: result.owner.toString(),
            dateUpd: result.dateUpd.toString(),
            commonIncentive: result.commonIncentive.toString(),
            status: result.propStatus.toString(),
            finalVerdict: result.finalVerdict.toString(),
          };
          if(!this.curProposalId){
            this.options.active = proposal;
            this.curProposalId = curload.toString();
          }
          if(this.curProposalId && this.curProposalId == proposal.id){
            this.options.active = proposal;
          }
          this.proposals.push(proposal);
          curload --;
          loadCount++;
        }
      }catch(e){
        console.error(e);
        this.$message.error(e.message);
      }finally{
        // 解锁，数据加载完成
        this.dataLoading = false;
        this.loading = false;
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#gov-proposal{
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
  .pagination{
    margin-top: 10px;
  }
  .proposals{
    height: calc(100% - 80px);
    overflow-y: auto;
    margin-top: 10px;
    .proposal{
      line-height: 30px;
      cursor: pointer;
      padding: 0px 5px 0px 5px;
      margin: 0px 15px 0px 15px;
    }
    .proposal:hover{
      background-color: #F2F6FC;
    }
    .active{
      background-color: #ffeeee;
    }
    .title{
      text-align: left;
      font-size: 14px;
      .id{
        margin-right: 10px;
      }
    }
    .footer{
      float: right;
      font-size: 12px;
    }
  }
}
</style>
<style lang="scss">
#gov-proposal{
  .box-card{
    .el-card__body{
      height: 100%;
      padding-left: 0px !important;
      padding-right: 0px !important;
    }
  }
}
</style>
