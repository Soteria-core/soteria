<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <svg-icon icon-class="vip" class="vip-icon" v-if="member.isMember"></svg-icon>
      <div style="display: inline-block;">
        <el-button
          v-if="member.account && web3Status === AVAILABLE"
          @click="accountDialogVisible = true"
          type="primary"
          round
          size="small">
          {{formatterAddress(member.account)}}
        </el-button>
        <el-button v-else type="primary" round @click="walletDialogVisible = true">
          Connect
        </el-button>
      </div>
    </div>

    <el-dialog
      title="Your Wallet"
      :visible.sync="accountDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      @close="accountDialogVisible=false"
      :width="device==='mobile'?'100%':'600px'"
      class="wallet-select account">
      <div class="page-title" style="position: relative;">
        {{member.account}}
        <input id="account-copy-input" type="text" :value="member.account" style="position: absolute; opacity: 0;">
      </div>
      <div>
        <el-button type="text" @click="openExplorer"><i class="el-icon-link"></i> View on BscScan</el-button>
        <el-button type="text" @click="copyAccount"><i class="el-icon-copy-document"></i> Copy Address</el-button>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="logout">Logout</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="Connect to a wallet"
      :visible.sync="walletDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      @close="walletDialogVisible=false"
      class="wallet-select"
      :width="device==='mobile'?'100%':'360px'">
      <div>
        <div class="item" @click="connect(WALLET_TYPE.INJECTED)">
          <span>Metamask</span>
          <svg-icon icon-class="metamask" class="icon"></svg-icon>
        </div>
        <div class="item" @click="connect(WALLET_TYPE.INJECTED)">
          <span>TrustWallet</span>
          <svg-icon icon-class="trustwallet" class="icon"></svg-icon>
        </div>
        <div class="item" @click="connect(WALLET_TYPE.INJECTED)">
          <span>MathWallet</span>
          <svg-icon icon-class="mathwallet" class="icon"></svg-icon>
        </div>
        <div class="item" @click="connect(WALLET_TYPE.INJECTED)">
          <span>TokenPocket</span>
          <svg-icon icon-class="tokenpocket" class="icon"></svg-icon>
        </div>
        <div class="item" @click="connect(WALLET_TYPE.WALLET_CONNECT)">
          <span>WalletConnect</span>
          <svg-icon icon-class="walletconnect" class="icon"></svg-icon>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { WEB3_STATUS, WALLET_TYPE } from '@/utils/Constants.js'

export default {
  components: {
    Breadcrumb,
    Hamburger,
  },
  data(){
    return {
      accountDialogVisible: false,
      walletDialogVisible: false,
      AVAILABLE: WEB3_STATUS.AVAILABLE,
      WALLET_TYPE: WALLET_TYPE
    }
  },
  computed: {
    ...mapGetters([
      'device',
      'settings',
      'sidebar',
      'web3',
      'web3Status',
      'member'
    ]),
  },
  methods: {
    formatterAddress(account){
      let acc = account && this.web3Status === this.AVAILABLE  ? account : "Connect Metamask";
      return this.formatterLongString(acc, 30, 5, 5);
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    connect(type) {
      this.walletDialogVisible = false
      this.$store.dispatch('app/setWeb3', { web3: this.$CustomWeb3, settings: this.settings, type: type});
    },
    logout() {
      this.accountDialogVisible = false
      this.$store.dispatch('app/disconnect', { web3: this.$CustomWeb3 });
    },
    copyAccount() {
      const obj = document.getElementById('account-copy-input');
      //选择当前对象
      obj.select();
      if (document.execCommand("Copy", this.member.account, null)) {
        //如果复制成功
        this.$message.success('Copied')
      }
    },
    openExplorer() {
      const target = `${this.settings.explorerURL}/address/${this.member.account}`
      if (this.device === 'mobile') { // ios safari不支持window.open
        location.href = target
        return
      }
      window.open(target)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.wallet-select {
  .el-dialog {
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 0 24px;
      height: 48px;
      font-weight: 600;
      border-radius: 16px;
      color: $--color-primary;
      background-color: #F5F7FA;
      cursor: pointer;
      .icon {
        width: 32px;
        height: 32px;
      }
    }
  }
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 2px 4px rgba($color: #FC5653, $alpha: 0.8);

  .vip-icon{
    width:30px !important;
    height:30px !important;
    fill:$--color-primary !important;
    font-weight: bold !important;
    margin-right:15px !important;
    vertical-align: middle !important;
  }
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    margin-right: 20px;
    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }
  }
}
</style>
