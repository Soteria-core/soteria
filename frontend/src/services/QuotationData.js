import QuotationData from '@/contracts/QuotationData.json'
import BaseContract from './BaseContract'

const QuotationData_KEY = "QuotationData";

class QuotationDataContract extends BaseContract {
  constructor(vue) {
    super(QuotationData_KEY, QuotationData, vue);
  }
}
QuotationDataContract.key = QuotationData_KEY;
export default QuotationDataContract
