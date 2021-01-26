
import PoolData from '@/contracts/PoolData.json'
import BaseContract from './BaseContract'

const PoolData_KEY = "PoolData";

class PoolDataContract extends BaseContract {
  constructor(vue) {
    super(PoolData_KEY, PoolData, vue);
  }
}
PoolDataContract.key = PoolData_KEY;
export default PoolDataContract

