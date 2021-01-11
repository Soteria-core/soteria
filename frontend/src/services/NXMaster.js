import NXMaster from '@/contracts/NXMaster.json'
import BaseContract from './BaseContract'

const NXMaster_KEY = "NXMaster";

class NXMasterContract extends BaseContract {
  constructor(vue) {
    super(NXMaster_KEY, NXMaster, vue);
  }
}
NXMasterContract.key = NXMaster_KEY;
export default NXMasterContract
