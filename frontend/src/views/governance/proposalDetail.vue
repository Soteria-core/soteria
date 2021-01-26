<template>
  <div id="gov-proposal-detail">
    <el-card class="box-card">
      <div slot="header">
        <h2 class="main-text">
          <highlight class="id secondary-text">#{{options.active.id}}</highlight>
          <highlight class="normal-text">{{options.active.title}}</highlight>
        </h2>
      </div>
      <ProposalDraft :options="options" v-if="options.active.status == 0" />
      <ProposalAwaitingSolutions :options="options" v-else-if="options.active.status == 1" />
      <ProposalMemberVote :options="options" v-else-if="showVote()" />
      <ProposalVoteView :options="options" v-else-if="showVoteView()" />
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ProposalDraft from './proposalDraft';
import ProposalAwaitingSolutions from './proposalAwaitingSolutions';
import ProposalMemberVote from './proposalMemberVote';
import ProposalVoteView from './proposalVoteView';
import GovernanceContract from '@/services/Governance';

export default {
  filters: {

  },
  components: { ProposalDraft, ProposalAwaitingSolutions, ProposalMemberVote, ProposalVoteView },
  props: ["options"],
  data() {
    return {
      members: [],
      Governance: null,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ]),

  },
  watch: {
    web3Status: watch.web3Status,
    "options.active": {
      handler(newVal){
        if(newVal){
          this.initData();
        }
      }
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
      if(!this.Governance) this.Governance = await this.getContract(GovernanceContract);
      this.getMemberVoteStatus();
      this.getSolutionAction();
    },
    getMemberVoteStatus(){
      const instance = this.Governance.getContract().instance;
      if(this.options.active && this.options.active.id){
        instance.memberProposalVote(this.member.account, this.options.active.id).then(res => {
          console.info(res, res.toString());
          this.options.active.voteId = res.toString();
          this.$forceUpdate();
        }).catch(e => {
          console.error(e);
          this.$message.error(e.message);
        });
      }
    },
    showVote(){
      return this.options.active.status == 2 && (!this.options.active.voteId || parseInt(this.options.active.voteId) == 0);
    },
    showVoteView(){
      return parseInt(this.options.active.status) > 2 || (this.options.active.status == 2 && parseInt(this.options.active.voteId) > 0)
    },
    getSolutionAction(){
      const instance = this.Governance.getContract().instance;
      const id = this.options.active.id;
      if(this.options.active && this.options.active.id && this.options.active.status > 1){
        this.options.paramValues = [];
        instance.getSolutionAction(id, 1).then(res => {
          // 目前所有治理参数都是两个，所以使用下面固定算法decode solution hash值，后期如过参数增加，需要修改此处代码
          const solutionHash = res[1].toString();
          const param1 = this.hexCharCodeToStr(solutionHash.substring(0, 34)).trim();
          const param2 = this.hex2int(solutionHash.substring(34));
          this.options.paramValues.push(param1);
          this.options.paramValues.push(param2);
        }).catch(e => {
          console.error(e);
          // this.$message.error(e.message);
        });
      }
    },
    hex2int(hex) {
        var len = hex.length, a = new Array(len), code;
        for (var i = 0; i < len; i++) {
            code = hex.charCodeAt(i);
            if (48<=code && code < 58) {
                code -= 48;
            } else {
                code = (code & 0xdf) - 65 + 10;
            }
            a[i] = code;
        }

        return a.reduce(function(acc, c) {
            acc = 16 * acc + c;
            return acc;
        }, 0);
    },
    hexCharCodeToStr(hexCharCodeStr) {
      var trimedStr = hexCharCodeStr.trim();
      var rawStr = trimedStr.substr(0,2).toLowerCase() === "0x" ?  trimedStr.substr(2) : trimedStr;
      var len = rawStr.length;
      if(len % 2 !== 0) {
        alert("Illegal Format ASCII Code!");
        return "";
      }
      var curCharCode;
      var resultStr = [];
      for(var i = 0; i < len;i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
        if(curCharCode == 0){
          break;
        }
        resultStr.push(String.fromCharCode(curCharCode));
      }
      return resultStr.join("");
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#gov-proposal-detail{
  height: calc(100vh - 146px);
  .box-card{
    height: calc(100%);
  }
  .id{
    margin-right: 10px;
  }
}
</style>
<style lang="scss">
#gov-proposal-detail{
  .box-card{
    .el-card__body{
      height: calc(100% - 110px);
      overflow-y: auto;
    }
  }
}
</style>
