<template>
  <div
    id="grantToken"
    v-loading.fullscreen.lock="loading"
    v-if="showGrants()"
    element-loading-text="Transaction is confirming ...">
    <el-card class="box-card" v-for="contAllowance in contractsAllowance" v-if="showGrant(contAllowance)">
      <el-row type="flex" style="flex-wrap: wrap;" justify="space-between" align="middle">
        <el-col :xs="24" :sm="24" :md="20" style="line-height: 24px" :class="{'mb16': device === 'mobile'}">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          Make sure sufficient {{ contAllowance.tokenName }} allowance approved before swap or deposit. Current allowance to
          <span style="color: #FC5653">{{contAllowance.contractName}}</span> contract is:
          <span class="highlight">{{formatAllowance(contAllowance.curAllowance)}}</span><span class="end">.</span>
        </el-col>
        <el-button type="primary" round @click="grant(contAllowance)" size="small">Approve</el-button>
      </el-row>
    </el-card>
    <el-dialog
      :title="'Grant ' + curAllowance.contractName + ' permission'"
      :visible.sync="dialogFormVisible"
      :width="device==='mobile' ? '100%' : '50%'"
      append-to-body
      :close-on-click-modal="false">
      <el-form :model="form" label-width="150px">
        <el-form-item label="Current allowance:">
          <span class="highlight">{{formatAllowance(curAllowance.curAllowance)}}</span> {{ curAllowance.tokenName }}
        </el-form-item>
        <el-form-item label="Allowance type:">
          <el-radio-group v-model="type">
            <el-radio-button label="Max"></el-radio-button>
            <el-radio-button label="Custom"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="New allowance:">
          <span v-if="type=='Max'" style="font-size:22px;">∞</span>
          <el-input-number
            v-else
            v-model="form.allowance"
            :size="device==='mobile' ? 'small' : 'large'"
            :min="1"
            :step="100"></el-input-number> {{ curAllowance.tokenName }}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="grantAllowance">Approve</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SOTETokenContract from '@/services/SOTEToken';
import { watch } from '@/utils/watch.js';
import { getAllowance, getWSOTEAllowance, grantAllowance, grantWSOTEAllowance } from '@/api/common.js'
import { BigNumber } from 'bignumber.js'

export default {
  name: "GrantTokens",
  components: {
  },
  data(){
    return {
      AVAILABLE: this.WEB3_STATUS.AVAILABLE,
      curAllowance: {
        contractName: null, // 需要授权的合约名称
        contractAddress: null, // 需要授权的合约地址
        tokenName: "SOTE", // 需要授权的币种名称
        needAllowance: null, // 需要授权多少SOTE
        curAllowance: "0", // 当前已有授权SOTE
        load: false, // 还未加载当前allowance
      },
      contractsAllowance: [],
      form: {
        allowance: "0"
      },
      type: "Max",
      SOTEToken: null,
      dialogFormVisible: false,
      loading: false,
    }
  },
  computed: {
    ...mapGetters([
      'device',
      'web3',
      'web3Status',
      'member'
    ]),
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
    this.initEvent();
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.SOTEToken = await this.getContract(SOTETokenContract);
      // console.info("SOTEToken:", this.SOTEToken);
    },
    initEvent(){
      this.$Bus.$on(this.$EventNames.refreshAllowance, async (contractAddress, contractName, tokenName="SOTE") => {
        this.contractsAllowance.forEach(item => {
          item.show = item.contractName == contractName
        })
        const list = this.contractsAllowance.filter(item=>item.contractName == contractName);
        let curAllowance = null;
        if(list != null && list.length == 1){
          curAllowance = list[0];
          curAllowance.contractAddress = contractAddress;
        }else{
          curAllowance = {
            contractAddress: contractAddress,
            contractName: contractName,
            tokenName: tokenName,
            curAllowance: "0",
            needAllowance: null,
            load: false,
            show: true
          }
          this.contractsAllowance.push(curAllowance);
        }
        let allowance = "0"
        if (tokenName === "SOTE") {
          allowance = await getAllowance(this, contractAddress);
        } else if (tokenName === "wSOTE") {
          allowance = await getWSOTEAllowance(this, contractAddress)
        }
        curAllowance.curAllowance = allowance;
        curAllowance.load = true;
        this.$Bus.$emit(this.$EventNames.refreshBalance, this); // 刷新余额
        this.$Bus.$emit(this.$EventNames.allowance, curAllowance);
      }); // 刷新Allowance

      this.$Bus.$on(this.$EventNames.resetAllowance, (contractName) => {
        if(contractName){
          const temp = this.contractsAllowance.filter(item => item.contractName != contractName);
          if(temp.length < this.contractsAllowance.length){
            this.contractsAllowance = temp;
            this.$Bus.$emit(this.$EventNames.allowance, {
              contractName: contractName,
              allowance: null,
            });
          }
        }else{
          this.contractsAllowance = [];
          this.$Bus.$emit(this.$EventNames.allowance, null);
        }
      }); // 重置Allowance

      this.$Bus.$on(this.$EventNames.setNeedAllowance, (contractName, needAllowance, needEther) => {
        let needAllowanceBN = needAllowance;
        if(needEther){
          needAllowanceBN = this.$ether(needAllowance.toString()).toString();
        }
        const list = this.contractsAllowance.filter(item=>item.contractName == contractName);
        if(list != null && list.length == 1){
          list[0].needAllowance = needAllowanceBN;
        }else{
          this.contractsAllowance.push({
            contractAddress: null,
            contractName: contractName,
            curAllowance: "0",
            needAllowance: needAllowanceBN,
            load: false,
          });
        }
      });
    },
    formatAllowance(allowance){
      if(allowance.length == this.$MaxUint256.length){
        return "∞";
      }
      let allo = this.$etherToNumber(allowance);
      return this.formatterLongString(allo.toString(), 20, 5, 5);
    },
    showGrants(){
      return this.contractsAllowance.filter(item => this.showGrant(item)).length > 0;
    },
    showGrant(contAllowance){
      if (!contAllowance.show) {
        return false
      }
      if(!contAllowance.contractName) {
        return false
      }
      if (contAllowance.contractName !== 'BuyBack' && !this.member.isMember) {
        return false;
      }
      if(!contAllowance.load){
        return false;
      }
      const curAllowanceBN = BigNumber(contAllowance.curAllowance);
      if(contAllowance.needAllowance != null && contAllowance.needAllowance > 0){
        const needAllowanceBN = BigNumber(contAllowance.needAllowance.toString());
        return needAllowanceBN.comparedTo(curAllowanceBN) >= 0;
      }
      let balanceBN = "0"
      if (contAllowance.tokenName === 'SOTE') {
        balanceBN = BigNumber(this.member.balance.toString());
      } else if (contAllowance.tokenName === 'wSOTE') {
        balanceBN = BigNumber(this.member.wbalance.toString());
      }
      return balanceBN.comparedTo(curAllowanceBN) >= 0;
    },
    grant(contAllowance){
      this.dialogFormVisible = true;
      this.curAllowance = contAllowance;
      if(contAllowance.curAllowance.length == this.$MaxUint256.length){
        this.form.allowance = "";
        this.type = "Max";
      }else{
        this.form.allowance = this.$etherToValue(contAllowance.curAllowance);
      }
    },
    async grantAllowance(){
      let allowance = this.form.allowance || '0';
      if(this.type == "Max"){
        allowance = new this.$CustomWeb3.web3.utils.BN(this.$MaxUint256);
      }else{
        if (allowance > 1000000000000000) {
          this.$message.error('The input number is too large.')
          return
        }
        allowance = this.$ether(allowance.toString());
      }
      this.loading = true;
      let result = null
      if (this.curAllowance.tokenName === 'SOTE') {
        result = await grantAllowance(this, this.curAllowance.contractAddress, allowance);
      } else if (this.curAllowance.tokenName === 'wSOTE') {
        result = await grantWSOTEAllowance(this, this.curAllowance.contractAddress, allowance);
      }

      if(result){
        this.$message.success(`Approved to grant ${this.curAllowance.contractName} permission is ${this.$etherToNumber(allowance)} ${this.curAllowance.tokenName}`);
        this.dialogFormVisible = false;
        this.curAllowance.curAllowance = allowance.toString();
        this.$Bus.$emit(this.$EventNames.allowance, this.curAllowance);
      }
      this.loading = false;
    }
  }
}
</script>

<style lang="scss" scoped>
#grantToken{
  display: inline-block;
  font-size: 14px;
  color: #606266;
  width: 100%;
  padding: 20px 20px 0px 20px;
  .el-input{
    width: 50px !important;
  }
  .el-input input {
    padding: 0 5 0 5;
  }

  .icon{
    margin-right: 10px;
  }
  .box-card{
    .end{
      margin-right: 20px;
    }
  }
}
</style>
<style>
#grantToken .el-card:not(:first-child){
  margin-top: 20px;
}
</style>
