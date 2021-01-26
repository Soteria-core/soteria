import ProposalCategory from '@/contracts/ProposalCategory.json'
import BaseContract from './BaseContract'

const ProposalCategory_KEY = "ProposalCategory";

class ProposalCategoryContract extends BaseContract {
  constructor(vue) {
    super(ProposalCategory_KEY, ProposalCategory, vue);
  }
}
ProposalCategoryContract.key = ProposalCategory_KEY;
export default ProposalCategoryContract
