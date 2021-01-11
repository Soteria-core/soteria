import Claims from '@/contracts/Claims.json'
import BaseContract from './BaseContract'

const Claims_KEY = "Claims";

class ClaimsContract extends BaseContract {
  constructor(vue) {
    super(Claims_KEY, Claims, vue);
  }
}
ClaimsContract.key = Claims_KEY;
export default ClaimsContract
