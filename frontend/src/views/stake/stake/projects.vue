<template>
  <div id="stake-stake-projects">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <highlight>Find Project</highlight>
      </div>
      <el-form inline label-width="100px" :model="form">
        <el-row style="margin-bottom: 20px;">
          <el-col :span="12">
            <el-form-item label="Sort by">
              <el-radio-group v-model="form.sortBy" @change="sort">
                <el-radio-button label="NEWTEST">NEWTEST</el-radio-button>
                <el-radio-button label="MOSTSTAEKD">MOST STAEKD</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
              <el-input placeholder="e.g. Compound" clearable @keyup.native="filter" @change="filter" v-model="form.search"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <br/>
    <el-row :gutter="20">
      <el-col v-for="(project, index) in projects" :span="8" style="margin-bottom: 20px;">
          <el-card class="li-degrees-badge-parent">
              <DegreesBadge v-if="project.status && project.status.length>0" :color="colors[project.status]" :fromColor="fromColors[project.status]" :toColor="toColors[project.status]">
                {{project.status.toUpperCase()}}
              </DegreesBadge>
              <div style="line-height: 40px;" class="title">
                <img :src="project.icon" class="project-large-icon" />
                <span>{{project.name}}</span>
              </div>
              <div style="height:25px;">
                <div>{{project.description}}</div>
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
              <div style="text-align: center;" v-if="project.status!='discard'">
                <el-button type="primary" :disabled="isSelected(project)" round size="mini" style="width: 150px;" @click="selectProject(project)">Select</el-button>
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
  components:{
  },
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
      try{
        const response = await getStakeProjects(this);
        this.projects = response.data;
        this.oldProjects = JSON.parse(JSON.stringify(response.data));
      }catch(e){
        console.error("Get projects failed.", e);
      }
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.PooledStaking = await this.getContract(PooledStakingContract);
      this.getAllStaked();
      if(!this.$route.params.stakedProjects){
        this.getDeposit();
        this.getStakedProjects();
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
          item.staked = res.toString();
          this.oldProjects[index].staked = res.toString();
        });
      });
    },
    getStakedProjects(){
      const contract = this.PooledStaking.getContract();
      contract.instance.stakerContractsArray(this.member.account).then(async res => {
        this.stakedProjects = res;
        console.info(res);
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
            this.options.selectedProject.push(item);
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
    isSelected(project){
      return this.options.selectedProject.filter(item=>item.name == project.name).length > 0;
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
@import '@/styles/element-variables.scss';
.el-form-item {
  margin-bottom: 0px;
  .el-input{
    width:246px;
  }
}
.icon-name {
  width: 40px;
  height: 40px;
  vertical-align: middle;
  margin-right: 20px;
  margin-bottom: 20px;
}
.title{
  vertical-align: middle;

}
</style>
