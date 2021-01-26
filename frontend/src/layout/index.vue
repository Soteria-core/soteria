<template>
  <div :class="classObj" class="app-wrapper" v-loading.fullscreen.lock="appLoading"
    element-loading-text="Application is loading ...">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div class="main-container" v-if="!showError">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
      </div>
      <app-main />
    </div>
    <el-dialog
      title="Tooltip"
      :visible="showError"
      width="500px"
      :close-on-click-moda="false"
      :close-on-press-escape="false"
      :show-close="false"
      append-to-body
      >
      <div v-if="tooltipType=='network'">
        <h1>Unsupported Network</h1>

        <span class="secondary-text"><svg-icon icon-class="circle" class="icon error-color"></svg-icon>Switch to BSC network to use the app!</span>
      </div>
      <div v-else>
        <h1>No installed the Metamask</h1>

        <span class="secondary-text">
          <svg-icon icon-class="circle" class="icon error-color"></svg-icon>Please install the Metamask!
          <el-button type="text" @click="downloadMetamask">Download</el-button>.<br/>
          If you have installed the Metamask, <el-button type="text" @click="reloadPage">please reload the Metamask</el-button>.
        </span>
      </div>


    </el-dialog>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapGetters } from 'vuex'
import { getSettings, getBNBQuote } from '@/api/common.js'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  data(){
    return {
      tooltipType:"network",
      SOTEMaster:null,
    }
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'settings',
      'web3Status',
      'loading'
    ]),
    appLoading(){
      return this.loading || this.member.loading;
    },
    showError(){
      if(this.web3 && this.web3.web3Provider && this.settings){
        const isMetaMask = this.web3.web3Provider.isMetaMask;
        if(!isMetaMask){
          //没有安装metamask
          this.tooltipType = "noMetaMask";
          return true;
        }
        const version = this.web3.web3Provider.networkVersion;
        const defaultVersion = this.settings.networkVersion;
        //判断网络是否正确
        this.tooltipType = "network";
        return version != defaultVersion;
      }
      return false;
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  watch:{
    "member.account":function(newVal, oldVal){
      if(newVal != oldVal && this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initData();
      }
    }
  },
  created(){
    this.initWeb3();
  },
  methods: {
    initData(){
      this.$Bus.$emit(this.$EventNames.initMember, this);
    },
    reloadPage(){
      window.location.reload();
    },
    downloadMetamask(){
      window.open("https://metamask.io/");
    },
    async initWeb3(){
      // 入口初始化系统配置及web3，TruffleContract工具类
      const response = await getSettings();
      const settings = response.data;
      console.info("settings:", settings);
      this.$store.dispatch("settings/changeSetting", { key: "settings", value: settings });
      this.$store.dispatch('app/setWeb3', { web3: this.$CustomWeb3, settings: settings});
      getBNBQuote(this);
    },

    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    },
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";
  .icon{
    margin-right: 10px;
  }
  .secondary-text{
    margin-bottom: 40px;
  }
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar{
      position: fixed;
      top: 0;
    }
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
