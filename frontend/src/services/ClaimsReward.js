import ClaimsReward from '@/contracts/ClaimsReward.json'
import BaseContract from './BaseContract'

const ClaimsReward_KEY = "ClaimsReward";

class ClaimsRewardContract extends BaseContract {
  constructor(vue) {
    super(ClaimsReward_KEY, ClaimsReward, vue);
  }
}
ClaimsRewardContract.key = ClaimsReward_KEY;
export default ClaimsRewardContract
