<template>
    <div id="BNBAndSOTE" v-loading.fullscreen.lock="loading"
        :element-loading-text="loadingText">
        <el-form :model="form" :rules="rules" ref="form" :disabled="!member.isMember">
        <el-row>
            <h2 class="main-text">Swap</h2>
            <div class="normal-text">Buy or sell SOTE tokens. SOTE tokens grant you proportional power in the Soteria.</div>
        </el-row>
        <el-divider></el-divider>
        <el-row>
            <h3 class="main-text">Swap</h3>
            <div class="right">
                <LiBorderRadius class="balance">
                    Balance: {{balance}} SOTE
                </LiBorderRadius>
            </div>
        </el-row>
        <br/>
        <el-row class="transfer-area">
            <el-col :span="11">
                <el-card class="box-card-from">
                  <div slot="header" class="clearfix">
                    <span>Amount</span>
                    <el-link v-if="showReset" @click="form.amount='0'" type="primary" style="float: right; padding: 3px 0" :underline="false">Reset</el-link>
                    <el-link v-else @click="form.amount=balanceValue.toString()" type="success" :underline="false" style="float: right; padding: 3px 0">Max</el-link>
                  </div>
                  <div>
                    <el-form-item prop="amount">
                        <el-input placeholder="Please enter an amount" class="right-input" v-model="form.amount">
                            <el-select v-model="form.type" slot="append" style="width: 85px;">
                                <el-option :label="option" :value="option" v-for="option in typeOptions"></el-option>
                            </el-select>
                        </el-input>
                    </el-form-item>
                  </div>
                  <div class="right-rate" style="color:#FFFFFF;"> ~ </div>
                </el-card>
            </el-col>
            <el-col :span="2" class="icon-col">
                <div>
                    <i class="iconfont icon-swap" @click="switchType"></i>
                </div>
            </el-col>
            <el-col :span="11">
                <el-card class="box-card-to">
                  <div slot="header" class="clearfix">
                    <span>Amount to recevied</span>
                  </div>
                  <div>
                    <el-form-item prop="toAmount">
                        <el-input disabled class="right-input" v-model="form.toAmount">
                            <template slot="append">
                                {{toTypes[form.type]}}
                            </template>
                        </el-input>
                    </el-form-item>
                  </div>
                  <div class="right-rate">1 {{toTypes[form.type]}} = {{calculateRate}} {{form.type}}</div>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <div class="tip normal-text" v-if="member.isMember">
                <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
                Rate is set at transaction time and therefore could change.
            </div>
            <div class="tip normal-text" v-else>
                <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
                This address is not a member. Please make sure you have the correct address connected, or become a member.
            </div>
        </el-row>
        <el-row>
            <div class="right-rate">
                <el-button type="primary" round @click="swapTokens">Swap tokens</el-button>
            </div>
        </el-row>
        </el-form>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { watch } from '@/utils/watch.js';
    import Pool1Contract from '@/services/Pool1';
    import MCRContract from '@/services/MCR';
    import { getRate } from '@/api/common.js'
    import { BigNumber } from 'bignumber.js'

    export default {
      name: "BNBAndSOTE",

      data() {
        return {
            loading: false,
            loadingText: "loading...",
            Pool1: null, // 合约
            MCR: null, // 合约
            rate: 0, // 汇率
            rateBN: 0, // 汇率BN
            typeOptions: ["BNB", "SOTE"],
            toTypes: {
                "BNB": "SOTE",
                "SOTE": "BNB",
            },
            form: {
                type: "BNB",
                amount: "0",
                toAmount: "0",
            },
            rules: {
                amount: [
                    { required: true, trigger: 'blur',
                     validator: this.validateAmount },
                ],
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
        calculateRate(){
            if(this.form.type=="BNB"){
                return this.rate;
            }
            const curRage = BigNumber(this.rate);
            const toRage = BigNumber(1).dividedBy(curRage);
            return toRage.toString();
        },
        showReset(){
            const amount = BigNumber(this.form.amount);
            return this.form.type!='SOTE' || amount.comparedTo(0) > 0;
        },
        balance(){
            try{
                return this.$etherToNumber(this.member.balance);
            }catch(e){
                console.error(e);
                return 'N/A';
            }
        },
        balanceValue(){
            try{
                return this.$etherToValue(this.member.balance);
            }catch(e){
                return 0;
            }
        }
      },
      watch: {
        web3Status: watch.web3Status,
        'form.amount': function(newVal, oldVal){
            this.$refs.form.validate((valid) => {
              if (valid) {
                this.calc();
              }
            });
        }
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
          this.Pool1 = await this.getContract(Pool1Contract);
          this.MCR = await this.getContract(MCRContract);
          console.info("Pool1:", this.Pool1);
          console.info("MCR:", this.MCR);
          // 查询汇率
          this.getRate();
        },
        async getRate(){
            const rate = await getRate(this);
            this.rateBN = rate.toString();
            this.rate = this.$etherToValue(this.rateBN);
            console.info("Current rate:", this.rate);
        },
        switchType(){
          this.form.type = this.toTypes[this.form.type];
          this.calc();
        },
        calc(){
          const amount = BigNumber(this.form.amount);
          const rate = BigNumber(this.rate);
          if(this.form.type=="BNB"){
              const toAmount = amount.dividedBy(rate);
              this.form.toAmount = toAmount.toString();
          }else{
              const toAmount = amount.multipliedBy(rate);
              this.form.toAmount = toAmount.toString();
          }
        },
        swapTokens(){
          this.loading = true;
          this.$refs["form"].validate(async (valid) => {
            if (valid) {
              try{
                const contract = this.Pool1.getContract();
                // 转成string，否则prod打包后会报错
                const fee = this.$ether(this.form.amount).toString();
                if(this.form.type == "BNB"){
                    this.loadingText = "Buy token...";
                    contract.instance.buyToken({ from: this.$CustomWeb3.account, value: fee }).then(response => {
                      console.info(response, response.toString());
                      this.$message.success("Buy SOTE successfully!");
                      this.$emit("refresh");
                      this.loading = false;
                    }).catch((e) => {
                      console.error(e);
                      this.$message.error(e.message);
                      this.loading = false;
                    });
                }else{
                    // 出售SOTE前需要查询资金池允许卖的资金金额，资金池超过2000bnb才能出售
                    const mcrInstance = this.MCR.getContract().instance;
                    const maxSellTokens = await mcrInstance.getMaxSellTokens();
                    if(BigNumber(maxSellTokens.toString()).lt(fee)){
                      this.$message.error("Not enough BNB tokens in the pool.");
                      this.loading = false;
                      return;
                    }
                    // 系统里用BNB换SOTE价格显示需要优化下。这个结果需要乘以0.975，合约对反向套利有2.5%的惩罚金
                    const realfee = BigNumber(fee).multipliedBy(this.settings.penaltyRate).integerValue().toString();
                    contract.instance.sellSOTETokens(realfee, { from: this.$CustomWeb3.account }).then(response => {
                      console.info(response, response.toString());
                      this.$message.success("Sell SOTE successfully!");
                      this.$emit("refresh");
                      this.loading = false;
                    }).catch((e) => {
                      console.error(e);
                      this.$message.error(e.message);
                      this.loading = false;
                    });
                }
              }catch(e){
                console.error(e);
                this.loading = false;
              }
            } else {
              this.loading = false;
            }
          });
        },
        validateAmount(rule, value, callback){
          try{
            const result = /^((0(\.[0-9]+)?)|([1-9][0-9]*(\.[0-9]+)?))$/g.test(value);
            if(!result){
                callback(new Error('Please enter a valid amount'));
                return;
            }
            const amountBN = BigNumber(this.$ether(value));
            let balance = null;
            if(this.form.type == "SOTE"){
                balance = BigNumber(this.member.balance);
            }else{
                balance = BigNumber(this.member.accountBalance);
            }
            if(amountBN.comparedTo(balance)>0){
                callback(new Error('Insufficient funds'));
                return;
            }
            callback();
          }catch(e){
            callback(new Error(e.message));
          }
        },
        toMembership(){
          this.$router.replace("/start/member");
        }
      }
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/element-variables.scss';
    #BNBAndSOTE {
      padding-bottom: 20px;
    }
    .tip{
      line-height: 60px;
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


</style>
<style lang="scss">
    .right-input {
        .el-input__inner {
            text-align: right !important;
        }
    }
</style>
