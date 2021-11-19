<template>
  <div id="gov-proposal-detail">
    <el-card class="box-card">
      <div slot="header">
        <h2 class="main-text">
          <highlight class="id secondary-text">#{{options.activeProposal.id}}</highlight>
          <highlight class="title normal-text">{{options.activeProposal.title}}</highlight>
        </h2>
      </div>
      <ProposalDraft :options="options" v-if="options.activeProposal.status == 0" />
      <ProposalAwaitingSolutions :options="options" v-else-if="options.activeProposal.status == 1" />
      <ProposalMemberVote :options="options" v-else-if="showVote()" />
      <ProposalVoteView :options="options" v-else-if="showVoteView()" />
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import abi from 'ethereumjs-abi';
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
    "options.activeProposal": {
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
      if (!this.member.account) {
        return
      }
      const instance = this.Governance.getContract().instance;
      if(this.options.activeProposal && this.options.activeProposal.id){
        instance.memberProposalVote(this.member.account, this.options.activeProposal.id).then(res => {
          console.info(res, res.toString());
          this.options.activeProposal.voteId = res.toString();
          this.$forceUpdate();
        }).catch(e => {
          console.error(e);
          this.$message.error(e.message);
        });
      }
    },
    showVote(){
      return this.options.activeProposal.status == 2 && (!this.options.activeProposal.voteId || parseInt(this.options.activeProposal.voteId) == 0);
    },
    showVoteView(){
      return parseInt(this.options.activeProposal.status) > 2 || (this.options.activeProposal.status == 2 && parseInt(this.options.activeProposal.voteId) > 0)
    },
    getSolutionAction(){
      const instance = this.Governance.getContract().instance;
      const id = this.options.activeProposal.id;
      if(this.options.activeProposal && this.options.activeProposal.id && this.options.activeProposal.status > 1){
        this.options.paramValues = [];
        instance.getSolutionAction(id, 1).then(res => {
          const action = res[1].toString();
          let types = this.getParamsTypes()
          const decoded = abi.rawDecode(types, Buffer.from(action.substr(2),'hex'));
          this.addParams(types, decoded)
          // const param1 = this.hexCharCodeToStr(action.substring(0, 34)).trim();
          // const param2 = this.hex2int(action.substring(34));
          // this.options.paramValues.push(param1);
          // this.options.paramValues.push(param2);
        }).catch(e => {
          console.error(e);
          // this.$message.error(e.message);
        });
      }
    },
    getParamsTypes() {
      let category = this.options.activeProposal.category
      for (let c of this.options.formatters.categories) {
        if (c.index === category) {
          return c.params.map(p => p.type)
        }
      }
    },
    addParams(types, params) {
      for (let i = 0; i < types.length; i++) {
        let type = types[i]
        let param = params[i]
        if (type.includes('[]')) {
          // 数组暂时只有第一个元素
          param = param[0]
        }
        if (type.includes('bytes')) {
          param = new TextDecoder().decode(param)
        } else if (type.includes('address')) {
          param = '0x' + param
        } else if (type.includes('uint')) {
          param = param.toString()
        }
        this.options.paramValues.push(param);
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
#gov-proposal-detail{
  height: calc(100vh - 146px);
  .box-card{
    display: flex;
    flex-direction: column;
    height: calc(100%);
  }
  .id{
    margin-right: 10px;
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
<style lang="scss">
#gov-proposal-detail{
  .box-card{
    .el-card__body{
      //height: calc(100% - 110px);
      overflow-y: auto;
    }
  }
}
</style>
