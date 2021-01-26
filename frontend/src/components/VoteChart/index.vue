<template>
  <div id="vote-chart" :style="{'--left': cLeft + '%', '--center': cCenter + '%', '--right': cRight + '%', '--target': target}">
    <div class="title">
      <div>{{title}} <span v-if="target">({{target}} needed)</span></div>
    </div>
    <div class="bar">
      <div class="left"></div>
      <div class="center"></div>
      <div class="right"></div>
      <div class="target"></div>
    </div>
    <div class="text" v-if="!showLabel || showLabel=='all'">
      <div class="left"><svg-icon icon-class="circle" class="accepted"></svg-icon>Accepted <span class="normal-text">{{cLeft}}%</span></div>
      <div class="center"><svg-icon icon-class="circle" class="rejected"></svg-icon>Rejected <span class="normal-text">{{cCenter}}%</span></div>
      <div class="right"><svg-icon icon-class="circle" class="notVoted"></svg-icon>Not Voted <span class="normal-text">{{cRight}}%</span></div>
    </div>
    <div class="text" v-else-if="showLabel=='noVoted'">
      <div class="left"><svg-icon icon-class="circle" class="accepted"></svg-icon>Accepted <span class="normal-text">{{cLeft}}%</span></div>
      <div class="center"></div>
      <div class="right"><svg-icon icon-class="circle" class="rejected"></svg-icon>Rejected <span class="normal-text">{{cCenter}}%</span></div>
    </div>
  </div>
</template>

<script>
import { BigNumber } from 'bignumber.js';

export default {
  name: 'LiVoteChart',
  props: ["title", "left", "center", "right", "target", "showLabel"],
  data() {
    return {

    }
  },
  computed:{
    sum(){
      return BigNumber(this.left).plus(this.center).plus(this.right).toString();
    },
    cLeft(){
      return BigNumber(this.left).div(this.sum).times(100).toFixed(2, 1);
    },
    cCenter(){
      return BigNumber(this.center).div(this.sum).times(100).toFixed(2, 1);
    },
    cRight(){
      return BigNumber(100).minus(this.cLeft).minus(this.cCenter).toString();
    }
  },
  created(){
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#vote-chart{
  width: 100%;
  .title{
    color: #909399;
    font-weight: bold;
    line-height: 30px;
  }
  .bar{
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    .target{
      position: absolute;
      left: var(--target);
      width: 4px;
      height: 26px;
      border-radius: 2px;
      background-color: blue;
      top: 26px;
    }
    .left{
      width: var(--left);
      height: 20px;
      background-color: #67C23A;
      display: inline-flex;
    }
    .center{
      width: var(--center);
      height: 20px;
      background-color: #F56C6C;
      display: inline-flex;
    }
    .right{
      width: var(--right);
      height: 20px;
      background-color: #E4E7ED;
      display: inline-flex;
    }
  }
  .text{
    font-size: 12px;
    line-height: 30px;
    font-weight: bold;
    color: #909399;
    .left{
      width: 33.3333333%;
      display: inline-block;
    }
    .center{
      width: 33.3333333%;
      text-align: center;
      display: inline-block;
    }
    .right{
      width: 33.3333333%;
      display: inline-block;
      text-align: right;
    }
  }
  .accepted{
    color: #67C23A;
    margin-right: 5px;
  }
  .rejected{
    color: #F56C6C;
    margin-right: 5px;
  }
  .notVoted{
    color: #E4E7ED;
    margin-right: 5px;
  }
}
</style>
