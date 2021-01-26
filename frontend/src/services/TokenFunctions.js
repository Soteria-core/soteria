import TokenFunctions from '@/contracts/TokenFunctions.json'
import BaseContract from './BaseContract'

const TokenFunctions_KEY = "TokenFunctions";

class TokenFunctionsContract extends BaseContract {
  constructor(vue) {
    super(TokenFunctions_KEY, TokenFunctions, vue);
  }
}
TokenFunctionsContract.key = TokenFunctions_KEY;
export default TokenFunctionsContract
