import LiTitle from '@/components/Title/index'
import LiList from '@/components/List/index'
import LiBorderRadius from '@/components/BorderRadius/index'
import highlight from '@/components/Common/highlight'
import DegreesBadge from '@/components/DegreesBadge/index'
import GrantTokens from '@/components/GrantTokens/index'
import StartMembership from '@/components/StartMembership/index'
import LiVoteChart from '@/components/VoteChart/index'

// 这里是重点
const CustomComponents = {
  install: function(Vue){
    Vue.component('LiTitle', LiTitle);
    Vue.component('LiList', LiList);
    Vue.component('LiBorderRadius', LiBorderRadius);
    Vue.component('highlight', highlight);
    Vue.component('DegreesBadge', DegreesBadge);
    Vue.component('GrantTokens', GrantTokens);
    Vue.component('StartMembership', StartMembership);
    Vue.component('LiVoteChart', LiVoteChart);
  }
}

// 导出组件
export default CustomComponents
