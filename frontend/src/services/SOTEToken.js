
import SOTEToken from '@/contracts/SOTEToken.json'
import BaseContract from './BaseContract'

const SOTEToken_KEY = "SOTEToken";

class SOTETokenContract extends BaseContract {
  constructor(vue) {
    super(SOTEToken_KEY, SOTEToken, vue);
  }
}
SOTETokenContract.key = SOTEToken_KEY;
export default SOTETokenContract

