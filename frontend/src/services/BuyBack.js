import Claims from '@/contracts/BuyBack.json'
import BaseContract from './BaseContract'

const KEY = "BuyBack";

class BuyBackContract extends BaseContract {
  constructor(vue) {
    super(KEY, Claims, vue);
  }
}
BuyBackContract.key = KEY;
export default BuyBackContract
