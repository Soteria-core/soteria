import TokenData from '@/contracts/TokenData.json'
import BaseContract from './BaseContract'

const TokenData_KEY = "TokenData";

class TokenDataContract extends BaseContract {
  constructor(vue) {
    super(TokenData_KEY, TokenData, vue);
  }
}
TokenDataContract.key = TokenData_KEY;
export default TokenDataContract