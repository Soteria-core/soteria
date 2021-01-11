<template>
  <el-card id="stake-unstake-unstake" class="box-card">
    <h3 class="main-text">Unstake</h3>
    <div class="secondary-text">
      <svg-icon icon-class="circle" class="icon-name error-color"></svg-icon>
      If you unstake from a project you will enter a 90 day lock up period.
      During this time you will continue to receive SOTE rewards
      and can still lose some (or all) of your deposit if a successful claim is made.
    </div>
  </el-card>
</template>

<script>
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-unstake-unstake{
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
  .secondary-text{
    line-height: 35px;
  }
}
</style>
