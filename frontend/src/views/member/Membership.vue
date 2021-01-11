<template>
  <div class="app-container">
    <Register v-if="!member.isMember"/>
    <Member v-else></Member>
  </div>
</template>

<script>
import styles from '@/styles/element-variables.scss';
import MemberRolesContract from '@/services/MemberRoles';
import Register from '@/views/member/Register'
import Member from '@/views/member/Member'
import { mapGetters } from 'vuex'

export default {
  name: 'Membership',
  components:{Register, Member},
  data() {

    return {
      loading : true,

      MemberRoles: null,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member'
    ]),
  },
  created(){
  },
  methods: {
    async initContract(){
      this.MemberRoles = await this.getContract(MemberRolesContract);
    },
  }
}

</script>

<style lang="scss" scoped>
.right {
  position: absolute;
  right: 0px;
  top: 20px;
}
.icon{
  margin-right: 10px;
}
.line-height-1{
  line-height: 2.5;
}
.line-height-2{
  line-height: 1.5;
  margin-left:20px;
}
.country{
  margin:10px
}
.right-bottom {
  float: right;
  margin: 20px;
}
</style>
