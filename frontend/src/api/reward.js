import PooledStakingContract from '@/services/PooledStaking';
import ClaimsRewardContract from '@/services/ClaimsReward';

export async function getStakeReward(vue) {
  if(!vue.$CustomWeb3.account){
    return;
  }
  const member = vue.$store.getters.member;
  // console.log('member.isMember:: ', member.isMember);
  if(!member.isMember){
    return;
  }
  const PooledStaking = await vue.getContract(PooledStakingContract);
  const instance = PooledStaking.getContract().instance;
  const res = await instance.stakerReward(member.account);
  return res.toString()
}

export async function getClaimsReward(vue) {
  if(!vue.$CustomWeb3.account){
    return;
  }
  const member = vue.$store.getters.member;
  if(!member.isMember){
    return;
  }
  const PooledStaking = await vue.getContract(ClaimsRewardContract);
  const instance = PooledStaking.getContract().instance;
  const res = await instance.getRewardToBeDistributedByUser(member.account);
  return res.toString()
}

export async function getGovernanceRewards(vue) {
  return '0'
}

export async function getRewardData(vue){
  return await Promise.all([getStakeReward(vue), getClaimsReward(vue), getGovernanceRewards(vue)])
}
