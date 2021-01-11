<template>
    <fragment v-if="item.meta && !item.hidden">
      <el-menu-item-group>
        <span slot="title">{{item.meta.title}}</span>
        <Permission v-for="subRoute in item.children" :permissions="[subRoute.name]" type="remove">
          <app-link v-if="subRoute.meta" :to="resolvePath(subRoute.path)">
            <el-menu-item :index="item.path + '/' + subRoute.path">
              <item :icon="item.meta.icon||(subRoute.meta&&subRoute.meta.icon)" :title="subRoute.meta.title" />
            </el-menu-item>
          </app-link>
        </Permission>
      </el-menu-item-group>
    </fragment>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'
import Item from './Item'
import Permission from '@/components/Permission/index'

export default {
  name: 'NewSidebarItem',
  components: { AppLink, Item, Permission },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  methods: {
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
