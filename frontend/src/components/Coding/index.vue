<template>
    <div class="coding">
        <div><img :src="coding"/></div>
        Programmers are working hard to catch up the schedule...
    </div>
</template>

<script>
import coding from "@/assets/images/java.jpg"
export default {
  name: 'Coding',
  data(){
    return {
        coding: coding
    }
  }
}
</script>

<style lang="scss" scoped>
.coding {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: red;
}
</style>
