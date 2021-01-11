<template>
  <div id="stake-stats-notes">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="normal-text-bold">*Notes</span>
      </div>
      <div class="secondary-text notes">
        <highlight>APY</highlight> is calculated by dividing the sum of all rewards paid out per each contract to its average stake, and then the result is annualized.
        <br/>
        To calculate your leverage, add up the estimated APYs for the projects you stake on.
        <br/>
        <highlight>COVER PRICE</highlight> is the price for annual cover; % of the cover amount.
        <br/>
        <highlight>NET STAKE</highlight> excludes any pending unstake requests from <highlight>TOTAL STAKE</highlight>.
        <br/>
        <highlight red>Needs staking</highlight> - To unlock further cover capacity, more staking is required.
        <br/>
        <highlight red>MCR capped</highlight> - The system has reached its global cover limit, which is 20% of MCR. More capacity will unlock as the capital pool of the mutual grows or existing covers expire.
      </div>
    </el-card>
  </div>
</template>

<script>
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-stats-notes{
  .notes {
    line-height: 35px;

    .li-highlight[red]{
      font-weight: bold;
      color: #ff4949;
    }
  }
}
</style>
