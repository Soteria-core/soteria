<template>
  <div id="stake-stake" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card class="box-card">
      <el-steps :active="options.active" align-center finish-status="success" process-status="finish">
        <el-step title="Add projects"></el-step>
        <el-step title="Deposit and stake"></el-step>
        <el-step title="Terms and conditions"></el-step>
        <el-step title="Confirm"></el-step>
      </el-steps>
    </el-card>
    <br />
    <el-row :gutter="20">
      <el-col :span="18">
        <transition name="el-fade-in-linear" mode="out-in">
          <projects :options="options" v-if="options.active==0" @selectProject="selectProject"/>
          <deposit :options="options" v-if="options.active==1" @addMore="options.active=0"/>
          <terms :options="options" v-if="options.active==2"/>
          <confirm :options="options" v-if="options.active==3" @addMore="options.active=0"/>
        </transition>
      </el-col>
      <el-col :span="6">
        <selected class="right-top" :options="options" @next="next" @back="back"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import projects from '@/views/stake/stake/projects';
import deposit from '@/views/stake/stake/deposit';
import terms from '@/views/stake/stake/terms';
import confirm from '@/views/stake/stake/confirm';
import selected from '@/views/stake/stake/selected/index';
import PooledStakingContract from '@/services/PooledStaking'
import { BigNumber } from 'bignumber.js'

export default {
  components:{
    projects, deposit, terms, confirm, selected
  },
  data() {
    return {
      loading: false,
      PooledStaking: null,
      options: {
        active: 0,
        selectedProject: [],
        perAmount: 0, //本次充值金额，第一次不能小于20，后面可以为0
        totalAmount: 0, //本次之前的累计充值金额
        maxTotalAmount: 0, // 所有合约投入金额之和的上限，累计充值金额的10倍
        terms: [],
        redirect: null,
      },
      defaultOptions: {
        active: 0,
        selectedProject: [],
        perAmount: 0,
        totalAmount: 0,
        maxTotalAmount: 0,
        terms: [],
        redirect: null,
      }
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.$router.push("/system/stake/default");
    });
  },
  destroyed(){
    this.saveOptions();
  },
  methods: {
    initData(){
      let stakeString = localStorage.getItem("stake");
      if(stakeString){
        let options = JSON.parse(stakeString);
        options.active = 0;
        this.options = options;
      }
      // 获取路由参数
      const params = this.$route.params;
      if(params && params.stakedProjects){
        this.options.selectedProject = params.stakedProjects.concat(this.options.selectedProject);
        this.options.totalAmount = params.deposit;
        this.options.redirect = params.redirect;
      }

      if(this.options.redirect == "deposit"){
        this.options.active = 1;
      }
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      // 初始化合约
      this.PooledStaking = await this.getContract(PooledStakingContract);
      this.$Bus.$emit(this.$EventNames.refreshAllowance, this.settings.contracts.TokenController, "TokenController");
    },
    selectProject(project){

    },
    resetOptions(){
      this.options = JSON.parse(JSON.stringify(this.defaultOptions));
    },
    saveOptions(){
      const options = JSON.parse(JSON.stringify(this.options));
      options.selectedProject = options.selectedProject.filter(item=>!item.ownerStaked);
      localStorage.setItem("stake", JSON.stringify(options));
    },
    next(){
      if(this.options.active < 3){
        this.options.active ++;
      }else {
        // 提交数据到合约
        if(!this.member.isMember){
          this.$message.error("This address is not a member. Please make sure you have the correct address connected, or become a member.");
          return;
        }

        const contract = this.PooledStaking.getContract();
        // 转成string，否则prod打包后会报错
        const amountCount = this.$ether(this.options.perAmount.toString()).toString();
        const addresses = this.options.selectedProject.map(item=>item.address);
        // 合约的stake值是本次stake加上之前已经stake的值
        const stakes = this.options.selectedProject.map(item=>this.$ether(BigNumber(item.stake.toString()).plus(item.ownerStaked).toString()).toString());
        this.loading = true;
        console.info(amountCount, addresses, stakes);
        contract.instance.depositAndStake(amountCount, addresses, stakes, { from: this.member.account }).then(response => {
          console.info(response, response.toString());
          this.$message.success("Transaction successfully");
          this.loading = false;
          this.resetOptions();
          this.saveOptions();
          this.$router.push("/system/stake/default");
        }).catch((e) => {
          console.error(e);
          this.$message.error(e.message);
          this.loading = false;
        });
      }
    },
    back(){
      if(this.options.active == 0){
        this.$router.push("/system/stake/default");
      }
      if(this.options.active > 0){
        this.options.active --;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.right-top{

}
</style>
