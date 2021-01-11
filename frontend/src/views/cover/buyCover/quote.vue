<template>
  <div id="cover-buyCover-quote" v-loading.fullscreen.lock="loading"
        element-loading-text="Getting quote ...">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Cover details</span>
          </div>
          <el-form :model="options" :rules="rules" ref="form">
          <el-row :gutter="20" class="secondary-text">
            <el-col :span="12">
              <el-row>
                <el-card>
                  <div slot="header" class="clearfix">
                    <span>Amount</span>
                    <el-link @click="options.amount=parseInt(options.curContract.capacityBNB)" type="success" :underline="false" style="float: right; padding: 3px 0">Max</el-link>
                  </div>
                  <div>
                    <el-form-item prop="amount">
                      <el-input placeholder="Please enter an amount" class="right-input" v-model="options.amount" @input="checkAmount">
                        <el-select v-model="options.currency" slot="append" style="width: 80px;">
                          <el-option :label="option" :value="option" v-for="option in typeOptions"></el-option>
                        </el-select>
                      </el-input>
                    </el-form-item>
                  </div>
                  <div class="right-rate" style="color:#FFFFFF;"> ~ </div>
                </el-card>
              </el-row>
              <el-row class="tips">
                <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
                Enter the amount you want to be covered for.
              </el-row>
              <el-row>
                <el-card>
                  <div slot="header" class="clearfix">
                    <span>Period</span>
                    <el-link @click="options.period=settings.cover.maxPeriod" type="success" :underline="false" style="float: right; padding: 3px 0">Max</el-link>
                  </div>
                  <div>
                    <el-form-item prop="period">
                      <el-input placeholder="Please enter an amount" class="right-input" v-model="options.period" @input="checkPeriod">
                        <template slot="append">DAYS</template>
                      </el-input>
                    </el-form-item>
                  </div>
                  <div class="right-rate" style="color:#FFFFFF;"> ~ </div>
                </el-card>
              </el-row>
              <el-row class="tips">
                <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
                Enter the number of days to be covered for.
              </el-row>
            </el-col>
            <el-col :span="12" class="tips">
              You're covered for the following events:
              <ul>
                <li>the custodian gets hacked and you lose more than 10% of your funds.</li>
                <li>withdrawals from the custodian are halted for more than 90 days.</li>
              </ul>
              Check out full details <el-button type="text">here</el-button>.
            </el-col>
          </el-row>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="6">
        <contractSummary :options="options" @getQuote="getQuote"></contractSummary>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import contractSummary from './summary';
import { BigNumber } from 'bignumber.js'
import { getQuote } from '@/api/cover.js';

export default {
  components:{
    contractSummary
  },
  data() {
    return {
      typeOptions: ["BNB"],
      rules:{
        amount: [
          { required: true, trigger: 'blur',
            validator: this.validateAmount },
        ],
        period: [
          { required: true, trigger: 'blur',
            validator: this.validatePeriod },
        ],
      },
      loading: false
    }
  },
  props: ["options"],
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
      let newValue = this.getNumber(value).replace(/\./g, "");
      this.options.amount = newValue;
      return newValue;
    },
    //只允许输入合法的数字
    checkPeriod(value){
      let newValue = this.getNumber(value).replace(/\./g, "");
      this.options.period = newValue;
      return newValue;
    },
    validateAmount(rule, value, callback){
        if(BigNumber(value).comparedTo(1)<0){
            callback(new Error(`Enter an amount of at least 1 BNB!`));
            return;
        }
        if(BigNumber(value).comparedTo(this.options.curContract.capacityBNB)>0){
            callback(new Error(`Enter an amount of ${this.options.curContract.capacityBNB} BNB maximum!`));
            return;
        }
        callback();
    },
    validatePeriod(rule, value, callback){
        if(BigNumber(value).lt(this.settings.cover.minPeriod) || BigNumber(value).gt(this.settings.cover.maxPeriod)){
            callback(new Error(`Enter a period of ${this.settings.cover.minPeriod} days minimum and ${this.settings.cover.maxPeriod} days maximum!`));
            return;
        }
        callback();
    },
    getQuote(){
      this.$refs.form.validate((valid)=>{
        if(valid){
          this.getCoverQuote();
        }
      });
    },
    getCoverQuote(){
      const params = {
        coverAmount: this.options.amount,
        currency: this.options.currency,
        period: this.options.period,
        contractAddress: this.options.curContract.address
      };
      this.loading = true;
      this.options.getQuoteTime = new Date().getTime();
      getQuote(params).then(res => {
        if(BigNumber(params.coverAmount.toString()).comparedTo(res.data.amount.toString()) > 0){
          this.$message.error("Insufficient staked deposit amount");
          this.loading = false;
          return;
        }
        this.options.quote = res.data;
        this.options.expiresTime = this.options.getQuoteTime + this.options.quote.expiresAt * 1000 - this.options.quote.generatedAt;
        this.options.active++;
        this.loading = false;
      }).catch(e=>{
        this.loading = false;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.tips{
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
