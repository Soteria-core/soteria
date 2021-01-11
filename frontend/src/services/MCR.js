import MCR from '@/contracts/MCR.json'
import BaseContract from './BaseContract'

const MCR_KEY = "MCR";

class MCRContract extends BaseContract {
  constructor(vue) {
    super(MCR_KEY, MCR, vue);
  }
}
MCRContract.key = MCR_KEY;
export default MCRContract

