<template>
  <div id="grantToken" v-loading.fullscreen.lock="loading"
    v-if="showGrants()"
    element-loading-text="Transaction is confirming ...">
    <el-card class="box-card" v-for="contAllowance in contractsAllowance" v-if="showGrant(contAllowance)">
      <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
      Make sure sufficient SOTE allowance approved before swap or deposit. Current allowance to
      <el-button type="text">{{contAllowance.contractName}}</el-button> contract is:
      <span class="highlight">{{formatAllowance(contAllowance.curAllowance)}}</span><span class="end">.</span>
      <el-button type="primary" round @click="grant(contAllowance)" size="small">Approve</el-button>
    </el-card>
    <el-dialog :title="'Grant ' + curAllowance.contractName + ' permission'"
        :visible.sync="dialogFormVisible" append-to-body
        :close-on-click-modal="false">
      <el-form :model="form" label-width="150px">
        <el-form-item label="Current allowance:">
          <span class="highlight">{{formatAllowance(curAllowance.curAllowance)}}</span> SOTE
        </el-form-item>
        <el-form-item label="Allowance type:">
          <el-radio-group v-model="type">
            <el-radio-button label="Custom"></el-radio-button>
            <el-radio-button label="Max"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="New allowance:">
          <el-input-number v-if="type=='Custom'" v-model="form.allowance" :min="1" :step="100"></el-input-number>
          <span v-else style="font-size:22px;">∞</span> SOTE
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
import elementStyle from '@/styles/element-variables.scss';
import SOTETokenContract from '@/services/SOTEToken';
import { watch } from '@/utils/watch.js';
import { getAllowance, grantAllowance } from '@/api/common.js'
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
        needAllowance: null, // 需要授权多少SOTE
        curAllowance: "0", // 当前已有授权SOTE
        load: false, // 还未加载当前allowance
      },
      contractsAllowance: [],
      form: {
        allowance: "0"
      },
      type: "Custom",
      SOTEToken: null,
      dialogFormVisible: false,
      loading: false,
    }
  },
  computed: {
    ...mapGetters([
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
      console.info("SOTEToken:", this.SOTEToken);
    },
    initEvent(){
      this.$Bus.$on(this.$EventNames.refreshAllowance, async (contractAddress, contractName) => {
        const list = this.contractsAllowance.filter(item=>item.contractName == contractName);
        let curAllowance = null;
        if(list != null && list.length == 1){
          curAllowance = list[0];
          curAllowance.contractAddress = contractAddress;
        }else{
          curAllowance = {
            contractAddress: contractAddress,
            contractName: contractName,
            curAllowance: "0",
            needAllowance: null,
            load: false,
          }
          this.contractsAllowance.push(curAllowance);
        }
        const allowance = await getAllowance(this, contractAddress);
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
        if(contAllowance.contractName && this.member.isMember){
          if(!contAllowance.load){
            return false;
          }
          const curAllowanceBN = BigNumber(contAllowance.curAllowance);
          if(contAllowance.needAllowance != null && contAllowance.needAllowance > 0){
            const needAllowanceBN = BigNumber(contAllowance.needAllowance.toString());
            return needAllowanceBN.comparedTo(curAllowanceBN) >= 0;
          }
          const balanceBN = BigNumber(this.member.balance.toString());

          return balanceBN.comparedTo(curAllowanceBN) >= 0;
        }
        return false;
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
      this.loading = true;
      let allowance = this.form.allowance;
      if(this.type == "Max"){
        allowance = new this.$CustomWeb3.web3.utils.BN(this.$MaxUint256);
      }else{
        allowance = this.$ether(allowance.toString());
      }
      const result = await grantAllowance(this, this.curAllowance.contractAddress, allowance);
      if(result){
        this.$message.success(`Approved to grant ${this.curAllowance.contractName} permission is ${this.$etherToNumber(allowance)} SOTE`);
        this.dialogFormVisible = false;
        this.curAllowance.curAllowance = allowance.toString();
        this.$Bus.$emit(this.$EventNames.allowance, this.curAllowance.contractName, this.curAllowance);
      }
      this.loading = false;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
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
