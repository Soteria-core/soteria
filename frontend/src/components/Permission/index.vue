<template>
    <fragment v-if="(hasPermission && type=='remove') || type!='remove'">
        <slot :hasPermission="hasPermission"></slot>
    </fragment>
</template>
<script>
    import store from '@/store'
    export default {
      name: "Permission",
      components: {
      },
      // type: remove, 无权限时移除组件；不指定时无权限时不删除组件，由业务组件控制自身行为
      props:["permissions", "type"],
      data(){
          return {
          }
      },
      computed:{
          hasPermission(){
              const settings = this.$store.getters && this.$store.getters.settings;
              const value = settings.features;
              if (value) {
                const hasPermissions = this.permissions.some(permission => {
                  return value[permission];
                })
                return hasPermissions;
              } else {
                throw new Error(`请设置操作权限标签值`)
              }
          }
      },
      methods:{
      }
    }
</script>
<style>
</style>
