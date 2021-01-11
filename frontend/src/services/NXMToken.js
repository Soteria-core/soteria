
import NXMToken from '@/contracts/NXMToken.json'
import BaseContract from './BaseContract'

const NXMToken_KEY = "NXMToken";

class NXMTokenContract extends BaseContract {
  constructor(vue) {
    super(NXMToken_KEY, NXMToken, vue);
  }
}
NXMTokenContract.key = NXMToken_KEY;
export default NXMTokenContract

