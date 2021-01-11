<template>
  <div class="li-list">
    <div v-for="item in listData">
      <el-row class="li-list-title">
        <slot name="title" :title="item.title">
          <div>{{item.title}}</div>
        </slot>
      </el-row>
      <el-row class="li-list-content">
        <slot name="content" :content="item.content">
          <div>{{item.content}}</div>
        </slot>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LiList',
  props:["listData"],
  data() {

    return {
    }
  },
  created(){
    console.info(this.listData);
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.li-list {
  line-height: 2;


  .li-list-title{
    color: #606266;
    font-size: 14px;
    font-weight: bold;
  }
  .li-list-content{
    color: #909399;
    font-size: 14px;
    margin-bottom: 10px;
  }
}
</style>
