import wSOTE from '@/contracts/wSOTE.json'
import BaseContract from './BaseContract'

const wSOTE_KEY = "wSOTE";

class wSOTEContract extends BaseContract {
  constructor(vue) {
    super(wSOTE_KEY, wSOTE, vue);
  }
}
wSOTEContract.key = wSOTE_KEY;
export default wSOTEContract
