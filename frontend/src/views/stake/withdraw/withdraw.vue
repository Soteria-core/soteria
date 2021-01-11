<template>
  <el-card id="stake-withdraw-withdraw" class="box-card">
    <el-form :model="options" :rules="rules" ref="form">
    <h3 class="main-text">Withdraw</h3>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>Amount</span>
          </div>
          <div>
            <el-form-item prop="withdraw">
                <el-input placeholder="Please enter an amount" class="right-input" v-model="options.withdraw" @input="checkAmount">
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
            <span>Remaining deposit</span>
          </div>
          <div>
            <el-form-item prop="deposit">
                <el-input disabled class="right-input" :value="remainingDeposit">
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
      <svg-icon icon-class="circle" class="icon-name"></svg-icon>
      You can withdraw {{$etherToValue(options.maxWithdraw)}} SOTE maximum.
    </el-row>
    </el-form>
  </el-card>
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
          withdraw: [
              { required: true, trigger: 'blur',
               validator: this.validateAmount },
          ],
      },
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    // 已经stake的总和
    usedAmount(){
      // 计算总和
      if(this.options.stakedProjects.length==0){
        return 0;
      }
      return this.options.stakedProjects.map(item=>item.ownerStaked)
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    maxTotalAmount(){
      return BigNumber(this.options.deposit.toString()).multipliedBy(this.settings.stake.maxAmount.toString()).toString();
    },
    percentage(){
      if(this.maxTotalAmount<=0){
        return 0;
      }
      let percent = BigNumber(this.usedAmount).div(this.maxTotalAmount).times(100);
      return percent.gt(100) ? 100 : parseFloat(percent.toFixed(2).toString());
    },
    remainingDeposit(){
      return BigNumber(this.options.deposit).minus(this.options.withdraw).toFixed(2, 1);
    }
  },
  watch: {
    web3Status: watch.web3Status,
    'options.withdraw': function(newVal, oldVal){
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
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    //只允许输入合法的数字
    checkAmount(value){
      let newValue = this.getNumber(value);
      this.options.withdraw = newValue;
      return newValue;
    },
    validateAmount(rule, value, callback){
      const vBN = BigNumber(value);
      if(vBN.lte(0)){
        console.info("不能小于等于0");
        callback(new Error('Enter a amount must be greater than 0!'));
        return;
      }
      
      if(vBN.gt(this.$etherToValue(this.options.maxWithdraw))){
        console.info("不能超过最大值");
        callback(new Error(`You can withdraw ${this.$etherToValue(this.options.maxWithdraw)} SOTE maximum.`));
        return;
      }
      callback();
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-withdraw-withdraw{
  h3{
    margin-top: 0px !important;
  }
}
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
</style>
<style lang="scss">
    .right-input {
        .el-input__inner {
            text-align: right !important;
        }
    }
</style>
