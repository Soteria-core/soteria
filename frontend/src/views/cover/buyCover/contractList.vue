<template>
  <div id="cover-buyCover-contracts">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Find Contract</span>
      </div>
      <el-form inline :disabled="!member.isMember" :model="form">
        <el-form-item label="Show">
          <el-checkbox-group v-model="form.show" @change="filter">
            <el-checkbox-button label="Smart contracts" key="Smart contracts">Smart contracts</el-checkbox-button>
            <el-checkbox-button label="Custodians" key="Custodians">Custodians</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Name:">
          <el-input v-model="form.search" placeholder="e.g. Compound" @keyup.native="filter"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="secondary-text">
            <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
            Find and select the contract you want to cover.
          </div>
        </el-form-item>
      </el-form>
    </el-card>
    <br/>
    <el-row :gutter="20">
      <el-col v-for="contract in contracts" v-if="contract.status!='discard'" :span="6" style="margin-bottom: 20px;">
        <el-card class="li-degrees-badge-parent">
          <DegreesBadge v-if="contract.new=='yes'" color="#dfe6ec" fromColor="#FC5653" toColor="#ff4949">
            NEW
          </DegreesBadge>
          <div style="line-height: 40px;" class="title">
            <img :src="contract.icon" class="project-large-icon" />
            <span>{{contract.name}}</span>
          </div>
          <el-form label-width="120px">
            <el-form-item label="Contract type">
              {{contract.type}}
            </el-form-item>
            <!-- <el-form-item label="Yearly Cost">
              {{contract.yearlyCost}}
            </el-form-item> -->
            <el-form-item label="Capacity">
              {{contract.capacityBNB}} BNB
            </el-form-item>
          </el-form>
          <div style="text-align: center;">
            <el-button type="primary" :disabled="isSelected(contract)" round size="mini" style="width: 150px;" @click="selectContract(contract)">Select</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { getCoverContracts } from '@/api/cover.js';

export default {
  components:{

  },
  props: ["options"],
  data() {
    return {
      active: 0,
      contracts: [],
      oldContracts: [],
      form:{
        show: ["Smart contracts", "Custodians"],
        search: ""
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
      const contracts = await getCoverContracts(this)
      this.contracts = contracts.data;
      this.oldContracts = JSON.parse(JSON.stringify(contracts.data));
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    search(value){
      return this.oldContracts.filter(item=>item.name.indexOf(value)>=0);
    },
    filter(){
      let contracts = null;
      if(this.form.search.length>0){
        contracts = this.search(this.form.search);
      }else{
        contracts = JSON.parse(JSON.stringify(this.oldContracts));
      }
      this.contracts = contracts.filter(item=>this.form.show.indexOf(item.type)>=0);
    },
    isSelected(contract){
      return this.options.ownerContracts.filter(item=>item.name == project.name).length > 0;
    },
    selectContract(contract){
      if(!contract.stake){
        contract.stake = "0";
      }

      this.options.curContract = JSON.parse(JSON.stringify(contract));
      this.$emit("selectContract", contract);
    },
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
}
.title{
  vertical-align: middle;
  font-size: 16px;
  font-weight: bold;
}
</style>
