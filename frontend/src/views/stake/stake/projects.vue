<template>
  <div id="stake-stake-projects">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Find Project</highlight>
      </div>
      <el-form inline label-width="100px" :model="form">
        <el-row>
          <el-col :xs="24" :sm="24" :md="12" class="mb20">
            <el-form-item label="Sort by">
              <el-radio-group v-model="form.sortBy" @change="sort">
                <el-radio-button label="NEWTEST">NEWEST</el-radio-button>
                <el-radio-button label="MOSTSTAEKD">MOST STAKED</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" class="mb20">
            <el-form-item label="Show">
              <el-checkbox-group v-model="form.show" @change="filter">
                <el-checkbox-button label="Smart contracts" key="Smart contracts">Smart contracts</el-checkbox-button>
                <el-checkbox-button label="Custodians" key="Custodians">Custodians</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="Search">
              <el-input
                placeholder="e.g. PancakeSwap"
                clearable
                @keyup.native="filter"
                @change="filter"
                v-model="form.search"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <br/>
    <el-row :gutter="20">
      <el-col v-for="(project, index) in projects" :key="project.address" :xs="24" :sm="12" :md="12" :lg="8" class="mb20">
        <el-card class="li-degrees-badge-parent">
          <DegreesBadge
            v-if="showProjectTag(project)"
            :color="colors[project.status]"
            :fromColor="fromColors[project.status]"
            :toColor="toColors[project.status]">
            {{project.status.toUpperCase()}}
          </DegreesBadge>
          <div style="line-height: 40px;" class="title">
            <img :src="project.icon" class="project-large-icon" />
            <span>{{project.name}}</span>
          </div>
          <div class="desc">
            <div class="desc-ellipsis">{{project.description}}</div>
            <el-tooltip placement="top" v-if="project.activityDesc.length" :disabled="project.activityDesc.length===1">
              <div slot="content">
                <div v-for="item in project.activityDesc" :key="item" class="lh24">Earn {{ item }} / SOTE weekly!</div>
              </div>
              <el-tag class="desc-activity" size="small">Earn {{project.activityDesc[0]}} / SOTE weekly!
                <i class="el-icon-more" v-if="project.activityDesc.length>1"></i>
              </el-tag>
            </el-tooltip>
          </div>
          <el-form label-width="100px">
            <el-form-item label="Project type">
              {{project.type}}
            </el-form-item>
            <el-form-item label="Staked">
              {{(project.staked && project.staked > 0) ? $etherToNumber(project.staked) : project.staked}} SOTE
            </el-form-item>
            <el-form-item label="APY">
              {{project.APY?project.APY:"N/A"}}
            </el-form-item>
          </el-form>
          <div style="text-align: center;">
            <el-button
              type="primary"
              :disabled="disSelected(project)"
              round
              size="mini"
              style="width: 150px;"
              @click="selectProject(project)">Select</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { getStakeProjects } from '@/api/stake.js';
import PooledStakingContract from '@/services/PooledStaking'

export default {
  components: {},
  props: ["options"],
  data() {
    return {
      active: 0,
      projects: [],
      oldProjects: [],
      stakedProjects: [],
      form: {
        sortBy: "NEWTEST",
        show: ["Smart contracts", "Custodians"],
        search: "",
      },
      PooledStaking: null,
      colors: {
        new: "#dfe6ec",
        discard: "#dfe6ec",
      },
      fromColors: {
        new: "#FC5653",
        discard: "#909399",
      },
      toColors: {
        new: "#ff4949",
        discard: "#606266",
      }
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),
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
    async initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        const response = await getStakeProjects(this);
        this.projects = response.data;
        this.oldProjects = JSON.parse(JSON.stringify(response.data));
        this.initContract();
      }
    },
    async initContract(){
      if(this.$route.params.stakedProjects){
        this.PooledStaking = await this.getContract(PooledStakingContract);
        this.getAllStaked();
      } else {
        // 在此页面加载数据会有问题
        // if (this.$route.fullPath !== 'system/stake/default') {
        this.$router.push({ name: this.$RouteNames.STAKE_DEFAULT, params: { defaultTab: "stake" } });
        // }
        // this.getDeposit();
        // this.getStakedProjects();
      }
    },
    getDeposit(){
      const contract = this.PooledStaking.getContract();
      contract.instance.stakerDeposit(this.member.account).then(res => {
        this.options.totalAmount = this.$etherToValue(res.toString());
      });
    },
    getAllStaked(){
      const contract = this.PooledStaking.getContract();
      this.projects.forEach((item, index) => {
        contract.instance.contractStake(item.address).then(res => {
          this.$set(item, 'staked', res.toString())
          // item.staked = res.toString();
          this.oldProjects[index].staked = res.toString();
        });
      });
    },
    getStakedProjects(){
      const contract = this.PooledStaking.getContract();
      contract.instance.stakerContractsArray(this.member.account).then(async res => {
        this.stakedProjects = res;
        // console.log('stakedProjects:: ', res);
        const count = this.options.selectedProject.filter(item=>this.stakedProjects.indexOf(item.address)>=0).length;
        if(count > 0){
          return;
        }
        const map = {};
        this.projects.filter(item=>this.stakedProjects.indexOf(item.address)>=0).forEach(item=>{
          const project = JSON.parse(JSON.stringify(item));
          if(!project.stake){
            project.stake = "0";
          }
          map[project.address] = project;
        });
        // 按顺序加载已stake合约，否则不能顺利进行下次stake
        for(let i=0;i<this.stakedProjects.length;i++){
          const item = map[this.stakedProjects[i]];
          if(item){
            await this.setStatedForAddress(item);
            const isExit = this.options.selectedProject.find((project) => {
              return project.address === item.address
            })
            !isExit && this.options.selectedProject.push(item);
          }
        }
      }).catch((e)=>{
        this.$message.error(e.message);
      });
    },
    async setStatedForAddress(item){
      const contract = this.PooledStaking.getContract();
      const ownerStaked = await contract.instance.stakerContractStake(this.member.account, item.address);
      item.stakedStatus = "staked";// 代表已经stake过了
      item.ownerStaked = this.$etherToValue(ownerStaked.toString());

      const unstaked = await contract.instance.stakerContractPendingUnstakeTotal(this.member.account, item.address);
      item.unstaked = this.$etherToValue(unstaked.toString());
      item.unstaking = 0;
    },
    disSelected(project){
      const isSelected = this.options.selectedProject.filter(item=>item.name == project.name).length > 0;
      return project.status=='discard' || isSelected;
    },
    sort(){
      let sort = "new";
      if(this.form.sortBy != "NEWTEST"){
        sort = "incentivized";
      }
      this.projects = this.projects.sort(item=> item.status == sort ? -1 : 1);
    },
    search(value){
      return this.oldProjects.filter(item=>item.name.indexOf(value)>=0);
    },
    filter(){
      let projects = null;
      if(this.form.search.length>0){
        projects = this.search(this.form.search);
      }else{
        projects = this.oldProjects;
      }
      this.projects = projects.filter(item=>this.form.show.indexOf(item.type)>=0);
      this.sort();
    },
    showProjectTag(project){
      if (!project.status) {
        return false
      }
      if (project.status !== 'new') {
        return true
      }
      // 新项目
      if (!project.createTime) {
        return true
      }
      return project.createTime > Date.now() - 7*24*60*60*1000 // 一周之内的项目
    },
    selectProject(project){
      if(!project.stake){
        project.stake = "0";
      }
      if(!project.ownerStaked){
        project.ownerStaked = "0";
      }
      this.options.selectedProject.push(JSON.parse(JSON.stringify(project)));
      this.$emit("selectProject", project);
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0px;

  .el-input {
    width: 246px;
  }
}

.icon-name {
  width: 40px;
  height: 40px;
  vertical-align: middle;
  margin-right: 20px;
  margin-bottom: 20px;
}

.title {
  vertical-align: middle;
}

.desc {
  height: 86px;

  &-ellipsis {
    margin-top: 8px;
    line-height: 18px;
    height: 54px;
    word-break: break-word;
    text-overflow: ellipsis;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    display: -webkit-box;
  }
  &-activity {
    margin-top: 8px;
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
