<template>
  <div class="li-degrees-badge">
    <div class="li-badge" :style="{
        'color': fontColor, 
        'background-color': bgFromColor, 
        'background-image': '-webkit-gradient(linear, left top, left bottom, from('+bgFromColor+')), to('+bgToColor+'))',
        'background-image': '-webkit-linear-gradient(top, '+bgFromColor+', '+bgToColor+')',
        'background-image': '-moz-linear-gradient(top, '+bgFromColor+', '+bgToColor+')',
        'background-image': '-ms-linear-gradient(top, '+bgFromColor+', '+bgToColor+')',
        'background-image': '-o-linear-gradient(top, '+bgFromColor+', '+bgToColor+')'
        }">
      <slot></slot>  
    </div>
  </div>
</template>

<script>
export default {
  name: 'LiDegreesBadge',
  props: ["color", "fromColor", "toColor"],
  data() {
    return {
    }
  },
  computed:{
    fontColor(){
      return this.color ? this.color : "#6a6340";
    },
    bgFromColor(){
      return this.fromColor ? this.fromColor : "#BFDC7A";
    },
    bgToColor(){
      return this.toColor ? this.toColor : "#8EBF45";
    },
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
.li-degrees-badge{
  overflow: hidden;
  position: absolute;
  width: 200px;
  height: 200px;
  top: -3px;
  right: -3px;
  .li-badge {
        font: bold 12px Sans-Serif;
        color: #333;
        text-align: center;
        text-shadow: rgba(255, 255, 255, 0.5) 0px 1px 0px;
        -webkit-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        position: relative;
        padding: 7px 0;
        right: -72px;
        width: 180px;
        top: 25px;
        color: var(--color);
        -webkit-box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
        box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
  }
}
</style>

<style>
.li-degrees-badge-parent{
  position: relative;
}
</style>
