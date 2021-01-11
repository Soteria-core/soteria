<template>
  <div id="registerMember" v-loading.fullscreen.lock="loading"
    element-loading-text="Payment membership fee in progress...">
    <el-row>
      <h1 class="main-text">Welcome</h1>
      <label class="normal-text">Being a member gives you the ability to swap SOTE tokens, buy cover, and earn rewards from staking, governance and claim assessment.</label>
    </el-row>
    <el-divider></el-divider>
    <el-row>
      <h2 class="main-text">Membership Fee</h2>
      <el-button type="primary" round class="right" size="small" disabled>Required</el-button>
      <LiTitle>Agreement</LiTitle>
      <LiList :listData="listData">
        <template slot="title" slot-scope="scope">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>
          {{scope.title}}
        </template>
      </LiList>
    </el-row>
    <el-divider></el-divider>
    <el-row class="line-height-1">
      <LiTitle>Mutual Requirements</LiTitle>
      <span class="secondary-text">Membership gives you the rights to the assets of the mutual and involves a one-off membership fee of
        <span class="normal-text-bold">0.1 BNB</span>.
      </span>
      <el-row>
        <span class="secondary-text">Due to various laws and regulations
          <span class="normal-text-bold">unfortunately we cannot accept members from the following jurisdictions</span>
          . We are working hard to try and reduce this list in the future.
        </span>
      </el-row>
    </el-row>
    <el-row>
      <el-tag class="country" :closable="false" :key="index" v-for="(country, index) in countries">{{country}}</el-tag>
    </el-row>
    <el-row class="line-height-1">
      <span class="secondary-text">By becoming a member you agree to the conditions specified in the
        <el-link type="primary" :underline="false" target="_blank" href="pdf/SoteriaRulesV1.0.pdf">Member Rules</el-link>.
      </span>
    </el-row>
    <el-row class="line-height-1">
      <span class="secondary-text">Some of the main conditions are summarised as follows:
      </span>
    </el-row>
    <el-row class="line-height-2">
      <span class="secondary-text">
        <li>The mutual may request that you withdraw your membership if it endangers the mutual as a whole.</li>
        <li>If the mutual was to run out of money you agree to pay a further £1 only.</li>
      </span>
    </el-row>
    <el-divider></el-divider>
    <div class="right-bottom"><el-button type="primary" round @click="register" :disabled="registerDisable">Pay membership fee</el-button></div>
  </div>
</template>

<script>
import styles from '@/styles/element-variables.scss';
import membershipJson from '@/views/member/data/membership.json';
import MemberRolesContract from '@/services/MemberRoles';
import { mapGetters } from 'vuex';
import { watch } from '@/utils/watch.js';

export default {
  name: 'Register',
  data() {
    return {
      loading: false,
      styles: styles,
      listData: [],
      countries: ["Mexico","Syria","Ethiopia","North Korea","Trinidad and Tobago",
        "India","Russia","Tunisia","Iran","Serbia","Vanuatu","Iraq","South Korea","Yemen","Japan","Sri Lanka"],
      MemberRoles: null,
      registerDisable: false,
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
  },
  created(){
    this.listData = membershipJson.list;
    this.initData();
  },
  methods: {
    initData(){
      if (this.web3Status === this.WEB3_STATUS.AVAILABLE) {
        this.initContract();
      }
    },
    async initContract(){
      this.MemberRoles = await this.getContract(MemberRolesContract);
      console.info("MemberRoles:", this.MemberRoles);
    },
    async register(){
      this.loading = true;
      const contract = this.MemberRoles.getContract();
      // 转成string，否则prod打包后会报错
      const fee = this.$ether("0.1").toString();
      this.registerDisable = true;
      contract.instance.payJoiningFee(this.$CustomWeb3.account, { from: this.$CustomWeb3.account, value: fee }).then(response => {
        console.info(response, response.toString());
        this.$message.success("Payment success, congratulations on becoming a member!");
        this.$Bus.$emit(this.$EventNames.initMember, this); // 刷新会员状态
        this.loading = false;
      }).catch((e) => {
        this.$message.error(e.message);
        this.registerDisable = false;
        this.loading = false;
      });
    }
  }
}

</script>

<style lang="scss" scoped>
.right {
  position: absolute;
  right: 0px;
  top: 20px;
}
.icon{
  margin-right: 10px;
}
.line-height-1{
  line-height: 2.5;
}
.line-height-2{
  line-height: 2.0;
  margin-left:20px;
}
.country{
  margin:10px
}
.right-bottom {
  float: right;
  margin: 20px;
}
</style>
