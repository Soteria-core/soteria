<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <svg-icon icon-class="vip" class="vip-icon" v-if="member.isMember"></svg-icon>
      <div style="display: inline-block;">
      <el-button v-if="member.account && this.web3Status === this.AVAILABLE" type="primary" round disabled size="small">
        {{formatterAddress(member.account)}}
      </el-button>
      <el-button v-else type="primary" round @click="connectMetamask">
        Connect Metamask
      </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import elementStyle from '@/styles/element-variables.scss';
import { WEB3_STATUS } from '@/utils/Constants.js'
import { getSettings } from '@/api/common.js'

export default {
  components: {
    Breadcrumb,
    Hamburger,
  },
  data(){
    return {
      AVAILABLE: WEB3_STATUS.AVAILABLE,
    }
  },
  computed: {
    ...mapGetters([
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
    async connectMetamask(){
      this.$store.dispatch('app/setWeb3', { web3: this.$CustomWeb3, settings: this.$settings});
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';

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
