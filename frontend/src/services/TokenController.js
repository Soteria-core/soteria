import TokenController from '@/contracts/TokenController.json'
import BaseContract from './BaseContract'

const TokenController_KEY = "TokenController";

class TokenControllerContract extends BaseContract {
  constructor(vue) {
    super(TokenController_KEY, TokenController, vue);
  }
}
TokenControllerContract.key = TokenController_KEY;
export default TokenControllerContract