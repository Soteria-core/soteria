import ClaimsData from '@/contracts/ClaimsData.json'
import BaseContract from './BaseContract'

const ClaimsData_KEY = "ClaimsData";

class ClaimsDataContract extends BaseContract {
  constructor(vue) {
    super(ClaimsData_KEY, ClaimsData, vue);
  }
}
ClaimsDataContract.key = ClaimsData_KEY;
export default ClaimsDataContract
