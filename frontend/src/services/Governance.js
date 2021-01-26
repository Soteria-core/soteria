import Governance from '@/contracts/Governance.json'
import BaseContract from './BaseContract'

const Governance_KEY = "Governance";

class GovernanceContract extends BaseContract {
  constructor(vue) {
    super(Governance_KEY, Governance, vue);
  }
}
GovernanceContract.key = Governance_KEY;
export default GovernanceContract
