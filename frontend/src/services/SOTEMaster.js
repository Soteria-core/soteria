import SOTEMaster from '@/contracts/SOTEMaster.json'
import BaseContract from './BaseContract'

const SOTEMaster_KEY = "SOTEMaster";

class SOTEMasterContract extends BaseContract {
  constructor(vue) {
    super(SOTEMaster_KEY, SOTEMaster, vue);
  }
}
SOTEMasterContract.key = SOTEMaster_KEY;
export default SOTEMasterContract
