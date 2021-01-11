import PooledStaking from '@/contracts/PooledStaking.json'
import BaseContract from './BaseContract'

const PooledStaking_KEY = "PooledStaking";

class PooledStakingContract extends BaseContract {
  constructor(vue) {
    super(PooledStaking_KEY, PooledStaking, vue);
  }
}
PooledStakingContract.key = PooledStaking_KEY;
export default PooledStakingContract
