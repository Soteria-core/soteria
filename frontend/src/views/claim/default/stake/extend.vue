<template>
  <div id="claim-default-stake-extend" v-loading.fullscreen.lock="loading"
    element-loading-text="Transaction is confirming ...">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="normal-text-bold">Extend stake period</div>
        <div class="secondary-text">
          When you assess a claim your stake period will be automatically increased by 7 days.
          If the final verdict is the same as yours, the period will be decreased back to where it was after you withdraw your claim assessment rewards.
          During the stake period you can't sell these tokens or use them for other purposes.
        </div>
      </el-col>
      <el-col :span="12">
        <el-form ref="form" :rules="rules" :model="form">
          <el-row class="transfer-area" :gutter="15">
            <el-col :span="12">

            </el-col>
            <el-col :span="12">
              <el-card>
                <div slot="header" class="normal-text">
                  <span>Extend stake period by</span>
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
                  <el-button type="primary" round @click="extend">Extend period</el-button>
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
  props: ["options"],
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
      const date = parseInt(this.options.period) + this.form.period * 24 * 60 * 60;
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
    onlyInteger(value){
      let newValue = parseInt(this.getNumber(value).replace(/\./g, ""));
      if(newValue.length > 0){
        newValue = parseInt(newValue);
      }else{
        newValue = 0;
      }
      return newValue;
    },
    extend(){
      const instance = this.TokenController.getContract().instance;
      // _reason为锁仓理由，这里填“CLA”字符串的byte形式为0x434c41；
      // 增加锁仓时间的接口  extendLockOf(address _of, bytes32 _reason, uint256 _time)
      this.$refs.form.validate(valid => {
        if(valid){
          const reason = this.$CLA_BYTE;
          const time = (this.form.period * 24 * 60 * 60).toString();
          this.loading = true;
          // instance.extendLockOf(this.member.account, reason, time, { from: this.member.account }).then(res => {
          instance.extendLock(reason, time, { from: this.member.account }).then(res => {
            console.info(res, res.toString());
            this.$emit("refresh");
            this.$message.success("Extend period successfully");
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
#claim-default-stake-extend{
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
