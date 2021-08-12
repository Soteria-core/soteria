<template>
  <div
    id="claim-default-stake-increase"
    v-loading.fullscreen.lock="loading"
    element-loading-text="Transaction is confirming ...">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="12" class="mb20">
        <div class="normal-text-bold">Increase stake</div>
        <div class="secondary-text">
          Remember! Your verdict power and rewards are proportional to your stake.
          To increase your rewards as a claims assessor you can always increase your stake.
          You will be able to withdraw only after the stake period finishes.
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="12">
        <el-form ref="form" :model="form">
          <el-row class="transfer-area" type="flex" style="flex-wrap: wrap;" justify="space-between" align="middle" :gutter="15">
            <el-col :xs="24" :sm="12" class="mb20">
              <el-card>
                <div slot="header" class="normal-text">
                  <span>Increase stake by</span>
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
            <el-col :xs="24" :sm="12" class="mb20">
              <el-card class="total-stake">
                <div slot="header" class="normal-text">
                  <span>Total stake</span>
                </div>
                <div>
                  <el-form-item prop="period">
                    <el-input disabled class="right-input" :value="totalStake">
                      <template slot="append">
                        SOTE
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
              <el-button type="primary" round @click="increase">Increase stake</el-button>
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
        amount: '',
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
      return this.$secondsToDateString(parseInt(this.options.period));
    },
    totalStake(){
      return this.$etherToNumber(this.options.staked);
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
    //只允许输入合法的数字
    onlyNumber(value){
      let newValue = parseInt(this.getNumber(value));
      this.form.amount = newValue;
      return newValue;
    },
    increase(){
      const amount = this.$ether(this.form.amount.toString());
      if(BigNumber(amount.toString()).comparedTo(0) <= 0){
        this.$message.error("Please enter a valid amount");
        return;
      }
      if(BigNumber(amount.toString()).comparedTo(this.member.balance) > 0){
        this.$message.error("Insufficient balance");
        return;
      }
      const instance = this.TokenController.getContract().instance;
      // _reason为锁仓理由，这里填“CLA”字符串的byte形式为0x434c41；
      const reason = this.$CLA_BYTE;
      this.loading = true;
      // 增加锁仓数量
      instance.increaseLockAmount(reason, amount, { from: this.member.account }).then(res => {
        console.info(res, res.toString());
        this.$message.success("Increase stake successfully");
        this.loading = false;
        this.$emit("refresh");
      }).catch(e => {
        console.error(e);
        this.$message.error(e);
        this.loading = false;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-stake-increase{
  .buttonArea{
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
  .total-stake{
    background-color: #DCDFE6;
    color: #909399;
  }
  .transfer-area{
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
