<template>
  <div id="borderRadius" class="li-borderRadius">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'LiBorderRadius',
  data() {

    return {
    }
  },

  methods: {
  }
}
</script>

<style lang="scss" scoped>
.li-borderRadius{
  border: 1px;
  border-radius: 30px;
  border-style: solid;
  border-color: #DCDFE6;
  padding: 10px;
  font-size: 14px;
  color: #909399;
}
</style>
