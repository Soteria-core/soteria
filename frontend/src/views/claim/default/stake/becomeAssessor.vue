<template>
  <div id="claim-default-stake-becomeAssessor" v-loading.fullscreen.lock="loading"
    element-loading-text="Transaction is confirming ...">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="normal-text-bold">Become a claims assessor</div>
        <div class="secondary-text">
          To earn reward as a claims assessor you need to stake an amount of SOTE for 30 days minimum.
          Your verdict power and rewards are proportional to your stake and for the specified period you can't sell these tokens or use them for other purposes.
          If the Advisory Board deems voting to be fraudulent, they have the power to burn this amount.
          For more info
          <el-button type="text">click here</el-button>
          or for the in-depth documents outlining the mechanics <el-button type="text">click here</el-button>.
        </div>
      </el-col>
      <el-col :span="12">
        <el-form ref="form" :rules="rules" :model="form">
          <el-row class="transfer-area" :gutter="15">
            <el-col :span="12">
              <el-card>
                <div slot="header" class="normal-text">
                  <span>Stake</span>
                </div>
                <div>
                  <el-form-item prop="amount">
                    <el-input placeholder="Please enter an amount" class="right-input" v-model="form.amount" @input="onlyNumber">
                      <template slot="append">
                        SOTE
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
                <div class="right-rate" style="color:#FFFFFF;"> ~ </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <div slot="header" class="normal-text">
                  <span>Stake period</span>
                </div>
                <div>
                  <el-form-item prop="period">
                    <el-input placeholder="Please enter an integer" class="right-input" v-model="form.period" @input="onlyInteger">
                      <template slot="append">
                        DAYS
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
                <div class="right-rate secondary-text">Stake period ends: {{period}}</div>
              </el-card>
            </el-col>
          </el-row>
          <el-row class="buttonArea">
              <div class="right-rate">
                  <el-button type="primary" round @click="becomeAssessor">Confirm</el-button>
              </div>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import TokenControllerContract from '@/services/TokenController';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  data() {
    return {
      form:{
        amount: 0,
        period: 0,
      },
      rules: {
        period: [
          { required: true, trigger: 'blur', type: "number", validator: this.validatePeriod },
        ],
      },
      TokenController: null,
      loading: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    period(){
      const date = (new Date().getTime()) / 1000 + this.form.period * 24 * 60 * 60;
      return this.$secondsToDateString(date);
    }
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
      // 需要授权
      this.$Bus.$emit(this.$EventNames.refreshAllowance, this.settings.contracts.TokenController, "TokenController");
      this.TokenController = await this.getContract(TokenControllerContract);
    },
    validatePeriod(rule, value, callback){
      if(BigNumber(value).lt(this.settings.claim.stake.minPeriod) || BigNumber(value).gt(this.settings.claim.stake.maxPeriod)){
        callback(new Error(`Enter a period of ${this.settings.claim.stake.minPeriod} days minimum and ${this.settings.claim.stake.maxPeriod} days maximum!`));
        return;
      }
      callback();
    },
    //只允许输入合法的数字
    onlyNumber(value){
      let newValue = this.getNumber(value);
      if(newValue.length > 0){
        newValue = parseInt(newValue);
      }else{
        newValue = 0;
      }
      this.form.amount = newValue;
      return newValue;
    },
    //只允许输入合法的数字
    onlyInteger(value){
      let newValue = this.getNumber(value).replace(/\./g, "");
      if(newValue.length > 0){
        newValue = parseInt(newValue);
      }else{
        newValue = 0;
      }
      this.form.period = newValue;
      return newValue;
    },
    becomeAssessor(){
      const amount = this.$ether(this.form.amount.toString());
      if(BigNumber(amount.toString()).comparedTo(0) <= 0){
        this.$message.error("Please enter a valid amount");
        return;
      }
      if(BigNumber(amount.toString()).comparedTo(this.member.balance) > 0){
        this.$message.error("Insufficient balance");
        return;
      }
      this.$refs.form.validate(valid => {
        if(valid){
          this.loading = true;
          const instance = this.TokenController.getContract().instance;
          // _reason为锁仓理由，这里填“CLA”字符串的byte形式为0x434c41；
          const reason = this.$CLA_BYTE;
          const time = (this.form.period * 24 * 60 * 60).toString();
          instance.lock(reason, amount, time, { from: this.member.account }).then(res => {
            console.info(res, res.toString());
            this.$emit("refresh");
            this.$message.success("Stake successfully");
            this.loading = false;
          }).catch(e => {
            console.error(e);
            this.$message.error(e);
            this.loading = false;
          });
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-stake-becomeAssessor{
  .buttonArea{
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .normal-text{
    font-weight: bold;
  }
  .normal-text-bold{
    line-height: 40px;
  }
  .secondary-text{
    line-height: 26px;
  }
  .icon{
    margin-right: 10px;
  }
  .right {
    position: absolute;
    right: 0px;
    top: 0px;
  }
  .right-rate {
    float: right;
    line-height: 40px;
  }
  .balance {
    background-color: #FEABA9;
    color: #FFFFFF !important;
  }
  .box-card-to{
    background-color: #DCDFE6;
    color: #909399;
  }
  .transfer-area{
      /*flex 布局*/
      display: flex;
      /*实现垂直居中*/
      align-items: center;
      /*实现水平居中*/
      justify-content: center;
      text-align: justify;
      .icon-col{
        text-align: center;
        div{
            i {
                font-size: 30px;
                color: $--color-primary;
                cursor: pointer;
            }
        }
      }

  }
}
</style>
<style lang="scss">
  .right-input {
    .el-input__inner {
      text-align: right !important;
    }
  }
</style>
