
import Pool1 from '@/contracts/Pool1.json'
import BaseContract from './BaseContract'

const Pool1_KEY = "Pool1";

class Pool1Contract extends BaseContract {
  constructor(vue) {
    super(Pool1_KEY, Pool1, vue);
  }
}
Pool1Contract.key = Pool1_KEY;
export default Pool1Contract

