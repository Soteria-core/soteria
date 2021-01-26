<template>
  <div id="cover-buyCover-payment" v-loading.fullscreen.lock="loading"
        element-loading-text="Transaction is confirming ...">
    <el-card class="box-card secondary-text">
      <div slot="header" class="clearfix">
        <span>Cover Summary</span>
        <LiBorderRadius class="balance" v-if="currency=='SOTE'">
            Balance: {{$etherToNumber(member.balance.toString())}} SOTE
        </LiBorderRadius>
        <LiBorderRadius class="balance" v-else>
            Balance: {{$etherToNumber(member.accountBalance.toString())}} BNB
        </LiBorderRadius>
      </div>
      <el-form label-width="160px">
      <div style="line-height: 40px;" class="title">
        <img :src="options.curContract.icon" class="project-large-icon" />
        <span>{{options.curContract.name}}</span>
      </div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Address">
            {{options.curContract.address}}
          </el-form-item>
          <el-form-item label="Yearly cost %">
            {{options.curContract.yearlyCost}}
          </el-form-item>
          <el-form-item label="Capacity">
            {{options.curContract.capacityBNB}} BNB
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Cover Amount">
            {{options.amount}} BNB
          </el-form-item>
          <el-form-item label="Cover Period">
            {{options.period}} days
          </el-form-item>
          <el-form-item label="Quote">
            {{$etherToNumber(options.quote.price.toString())}} BNB / {{$etherToNumber(options.quote.priceInNXM.toString())}} SOTE
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <el-row>
        <el-col :span="14" style="line-height: 35px;">
          <div>
            <el-checkbox v-model="checked" style="vertical-align: middle;">
            </el-checkbox>
            <el-link @click="checked=!checked" :underline="false" style="display: inline;">
            I agree that Smart Contract Cover is not a contract of insurance.
            Cover is provided on a discretionary basis with Soteria members
            having the final say on with claims are paid.
            </el-link>
          </div>
        </el-col>
        <el-col :span="10">
          <div style="float: right;">
            <el-form-item label="Buy cover using">
              <el-radio-group v-model="currency" style="width:260px">
                <el-radio-button label="BNB">BNB</el-radio-button>
                <el-radio-button label="SOTE">SOTE</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Amount due">
              {{currency=="BNB"?$etherToNumber(options.quote.price.toString()):$etherToNumber(options.quote.priceInNXM.toString())}} {{currency}}
            </el-form-item>
          </div>
        </el-col>
      </el-row>
      <div class="right">
        <el-button type="primary" plain round @click="back">Back</el-button>
        <el-button type="primary" round @click="buy" :disabled="!checked">Buy Cover</el-button>
      </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import QuotationContract from '@/services/Quotation';
import Pool1Contract from '@/services/Pool1';

export default {
  components:{

  },
  data() {
    return {
      checked: false,
      currency: "BNB",
      Quotation: null,
      Pool1: null,
      loading: false,
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
    currency(newVal){

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
	    this.$Bus.$emit(this.$EventNames.refreshAllowance, this.settings.contracts.TokenController, "TokenController");
	    this.$Bus.$emit(this.$EventNames.setNeedAllowance, "TokenController", this.options.quote.priceInNXM.toString());
      this.Quotation = await this.getContract(QuotationContract);
      this.Pool1 = await this.getContract(Pool1Contract);
    },
    back(){
      this.$emit("back");
    },
    buy(){
      if(this.currency == "SOTE"){
        this.buyUseSOTE();
      }else{
        this.buyUseBNB();
      }
    },
    buySuccess(){
      this.$message.success("Buy cover successfully");
      this.loading = false;
      this.$router.push("/system/cover/default");
    },
    buyUseBNB(){
      const contract = this.Pool1.getContract();
      this.loading = true;
      const { coverDetails, coverPeriod, coverCurr, smartCAdd, price, v, r, s } = this.buildParams();
      contract.instance.makeCoverBegin(
          smartCAdd, coverCurr, coverDetails, coverPeriod, v, r, s,
          { from: this.member.account, value: price }).then(res=>{
        console.info(res, res.toString());
        this.buySuccess();
      }).catch(e=>{
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    },
    buyUseSOTE(){
      const contract = this.Quotation.getContract();
      this.loading = true;
      const { coverDetails, coverPeriod, coverCurr, smartCAdd, v, r, s } = this.buildParams();
      contract.instance.makeCoverUsingSOTETokens(
          coverDetails, coverPeriod, coverCurr, smartCAdd, v, r, s,
          { from: this.member.account }).then(res=>{
        console.info(res, res.toString());
        this.buySuccess();
      }).catch(e=>{
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    },
    buildParams(){
      const quote = this.options.quote;
      return {
        coverDetails: [quote.amount, quote.price, quote.priceInNXM, quote.expiresAt.toString(), quote.generatedAt.toString()],
        coverPeriod: this.options.period,
        coverCurr: this.$BNB_BYTE8,
        smartCAdd: quote.contract,
        price: quote.price,
        v: quote.v,
        s: quote.s,
        r: quote.r,
      };
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.clearfix{
  line-height: 14px;
  font-size: 14px;
  font-weight: bold;
}
.balance {
  background-color: #FEABA9;
  color: #FFFFFF !important;
  float: right;
  line-height: 14px;
}
.right{
  float: right;
  margin-top: 10px;
  margin-bottom: 20px;
}
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
  font-size: 24px;
  font-weight: bold;
}
</style>
<style lang="scss">
@import '@/styles/element-variables.scss';
#cover-buyCover-payment{
  color: #909399;
  .el-checkbox__label {
    text-overflow: ellipsis;
    white-space: normal;
    display: inline-block;
    line-height: 30px;
  }
}
</style>
