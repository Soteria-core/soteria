<template>
  <div id="stake-stake-deposit">
    <el-card class="box-card">
      <el-form :model="options" :rules="rules" ref="form">
      <h2 class="main-text">Deposit</h2>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <div slot="header" class="clearfix">
              <span>Top Up</span>
              <el-link v-if="showReset" @click="options.perAmount='0'" type="primary" style="float: right; padding: 3px 0" :underline="false">Reset</el-link>
              <el-link v-else @click="options.perAmount=balance.toString()" type="success" :underline="false" style="float: right; padding: 3px 0">Max</el-link>
            </div>
            <div>
              <el-form-item prop="perAmount">
                  <el-input placeholder="Please enter an amount" class="right-input" v-model="options.perAmount" @input="checkAmount">
                      <template slot="append">SOTE</template>
                  </el-input>
              </el-form-item>
            </div>
            <div class="right-rate" style="color:#FFFFFF;"> ~ </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card-to">
            <div slot="header" class="clearfix">
              <span>Total deposit</span>
            </div>
            <div>
              <el-form-item prop="totalAmountShow">
                  <el-input disabled class="right-input" :value="totalAmountShow">
                      <template slot="append">
                          SOTE
                      </template>
                  </el-input>
              </el-form-item>
            </div>
            <div class="right-rate" style="color:#DCDFE6;"> ~ </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row class="normal-text" style="line-height: 25px;margin-top: 10px;">
        <svg-icon icon-class="circle" class="icon-name error-color"></svg-icon>
        Stake <highlight>20 SOTE minimum</highlight> per <highlight>new</highlight> project.
        Stake your total deposit up to <highlight>10 times, {{maxTotalAmountShow}} SOTE</highlight>.
        Top up your deposit to stake larger amounts.
      </el-row>
      </el-form>
    </el-card>
    <br />
    <el-card class="box-card">
      <el-table
        :data="options.selectedProject"
        stripe
        style="width: 100%">
        <el-table-column
          prop="name"
          label="PROJECT">
          <template slot-scope="scope">
            <div style="white-space: nowrap;">
              <img :src="scope.row.icon" class="project-list-icon" />
              {{scope.row.name}}    
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="stake"
          label="ADD">
          <template slot-scope="scope">
            <el-form :model="scope.row">
            <el-form-item :rules="scope.row.ownerStaked==0 ? rule : noRule" prop="stake">
              <el-input-number size="mini" v-model="scope.row.stake" class="right-input">
              </el-input-number>SOTE
            </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="stake"
          label="STAKED">
          <template slot-scope="scope">
            {{staked(scope.row)}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          label="OPTIONS">
          <template slot-scope="scope">
            <el-link type="primary" v-if="scope.row.stakedStatus != 'staked'" :underline="false" @click="removeProject(scope)">Remove</el-link>
            <el-link type="primary" v-else :underline="false" @click="unstake(scope)">Unstake</el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <div style="text-align: center;">
          <el-button type="text" @click="addMore">Add more projects</el-button>
        </div>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
      rules: {
          perAmount: [
              { required: true, trigger: 'blur',
               validator: this.validateAmount },
          ],
      },
      rule:[{ trigger: 'blur', validator: this.validatePerAmount }],
      noRule: [],
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    balance(){
        try{
            return this.$etherToNumber(this.member.balance.toString());
        }catch(e){
            console.error(e);
            return 'N/A';
        }
    },
    showReset(){
        const amount = BigNumber(this.options.perAmount.toString());
        return amount.comparedTo(0) > 0;
    },
    // 已经stake的总和
    usedAmount(){
      // 计算总和
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return this.options.selectedProject.map(item=>BigNumber(item.stake).plus(item.ownerStaked))
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    // 总充值金额，perAmount本次充值金额，totalAmount已经充值金额
    totalAmount(){
      return BigNumber(this.options.perAmount).plus(this.options.totalAmount).toString();
    },
    // 总充值金额，perAmount本次充值金额，totalAmount已经充值金额
    totalAmountShow(){
      return BigNumber(this.options.perAmount).plus(this.options.totalAmount).toFixed(2, 1).toString();
    },
    maxTotalAmountShow(){
      return BigNumber(this.options.maxTotalAmount).toFixed(2, 1).toString();
    }
  },
  watch: {
    web3Status: watch.web3Status,
    'options.perAmount': function(newVal, oldVal){
      this.maxTotalAmount();
      this.$refs.form.validate();
    },
  },
  created(){
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  methods: {
    initData(){
      // this.options.totalAmount = BigNumber.sum.apply(0, this.options.selectedProject.map(item=>item.ownerStaked)).toString();
      this.maxTotalAmount();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    staked(row){
      return BigNumber(row.stake.toString()).plus(row.ownerStaked).toFixed(2, 1).toString();
    },
    // 允许的最大stake总金额
    maxTotalAmount(){
      this.options.maxTotalAmount = BigNumber(this.options.perAmount.toString()).plus(this.options.totalAmount.toString())
                                            .multipliedBy(this.settings.stake.maxAmount.toString()).toString();
    },
    //只允许输入合法的数字
    checkAmount(value){
      let newValue = this.getNumber(value);
      this.options.perAmount = newValue;
      this.maxTotalAmount();
      return newValue;
    },
    validateAmount(rule, value, callback){
        const result = /^((0(\.[0-9]+)?)|([1-9][0-9]*(\.[0-9]+)?))$/g.test(value);
        if(!result){
            callback(new Error('Please enter a valid amount'));
            return;
        }
        // 第一次充值，最少充20
        if(BigNumber(this.options.totalAmount.toString()).comparedTo(0) == 0 && BigNumber(value.toString()).comparedTo(this.settings.stake.minAmountPerContract)<0){
            callback(new Error(`The initial deposit must be at least ${this.settings.stake.minAmountPerContract} SOTE`));
            return;
        }
        const amountBN = BigNumber(this.$ether(value.toString()));
        let balance = BigNumber(this.member.balance.toString());
        // 余额不足
        if(amountBN.comparedTo(balance)>0){
            callback(new Error('Insufficient funds'));
            return;
        }
        callback();
    },
    validatePerAmount(rule, value, callback){
      // 每个合约最少stake 20
      if(BigNumber(value).comparedTo(this.settings.stake.minAmountPerContract)<0){
        callback(new Error(`Stake ${this.settings.stake.minAmountPerContract} SOTE minumum per contract.`));
        return;
      }
      // 目前感觉没用，稍后验证
      if(BigNumber(this.$ether(this.usedAmount.toString()).toString()).comparedTo(BigNumber(this.member.balance.toString())) > 0){
        callback(new Error(`Top up with ${value} SOTE or stake ${this.options.perAmount} maximum per contract.`));
        return;
      }
    },
    removeProject(scope){
      this.options.selectedProject.splice(scope.$index, 1);
    },
    addMore(){
      this.$emit("addMore");
    },
    unstake(){
      // 导航到unstake页面
      const options = JSON.parse(JSON.stringify(this.options));
      options.stakedProjects = options.selectedProject.filter(item => item.stakedStatus == 'staked');
      this.$router.push({name: "Unstake", params: options});
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.icon-name {
  vertical-align: middle;
  margin-right: 15px;
}
.box-card{
  line-height: 24px;
}
.box-card-to{
  background-color: #DCDFE6;
  color: #909399;
}
.right-rate {
  float: right;
  line-height: 40px;
}
.clearfix{
  height: 30px;
}
.el-form-item{
  margin-bottom: 0px;
}
</style>
<style lang="scss">
    .right-input {
        .el-input__inner {
            text-align: right !important;
        }
    }
</style>
