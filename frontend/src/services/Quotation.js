import Quotation from '@/contracts/Quotation.json'
import BaseContract from './BaseContract'

const Quotation_KEY = "Quotation";

class QuotationContract extends BaseContract {
  constructor(vue) {
    super(Quotation_KEY, Quotation, vue);
  }
}
QuotationContract.key = Quotation_KEY;
export default QuotationContract
