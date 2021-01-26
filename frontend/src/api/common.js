import request from '@/utils/request'
import SOTEMasterContract from '@/services/SOTEMaster'
import SOTETokenContract from '@/services/SOTEToken';
import MCRContract from '@/services/MCR';
import wSOTEContract from '@/services/wSOTE';
import { BNB_BYTE8 } from '@/utils/Constants.js'

export const getSettings = (vue) => {
  return request({
      url:`/data/settings.json`,
      method:'get'
  });
}
// 初始化会员信息，判断是否是会员
export async function initMember(vue){
  if(!vue.$CustomWeb3.account){
    vue.$store.dispatch("member/setStatus", false);
    vue.$store.dispatch("member/setLoading", false);
    return;
  }
  const SOTEMaster = await vue.getContract(SOTEMasterContract);
  const contract = SOTEMaster.getContract();
  contract.instance.isMember(vue.$CustomWeb3.account).then(response=>{
    console.info("isMember:", response);
    vue.$store.dispatch("member/setLoading", false);
    vue.$store.dispatch("member/setStatus", response);
  }).catch((e)=>{
    vue.$message.error(`Loading member status failed. ${e.toString()}`);
    vue.$store.dispatch("member/setLoading", false);
  });
}

// 判断是否是会员
export async function isMember(vue, account){
  const SOTEMaster = await vue.getContract(SOTEMasterContract);
  const contract = SOTEMaster.getContract();
  try{
    const result = contract.instance.isMember(account);
    return result;
  }catch(e){
    vue.$message.error(`Loading member status failed. ${e.message}`);
    return false;
  }
}

export async function getAllowance(vue, contractAddress){
  if(!vue.$CustomWeb3.account){
    return -1;
  }
  const SOTEToken = await vue.getContract(SOTETokenContract);
  const contract = SOTEToken.getContract();
  try{
    const allowance = await contract.instance.allowance(vue.$CustomWeb3.account, contractAddress);
    console.info("Allowance: ", allowance.toString());
    return allowance.toString();
  }catch(e){
    console.error(e);
    vue.$message.error(e.message);
    return -1;
  }
}

export async function getBalance(vue){
  if(!vue.$CustomWeb3.account){
    return;
  }
  const SOTEToken = await vue.getContract(SOTETokenContract);
  const contract = SOTEToken.getContract();
  contract.instance.balanceOf(vue.$CustomWeb3.account).then(response => {
    console.info("SOTE Balance: ", response.toString());
    vue.$store.dispatch("member/setBalance", response.toString());
  }).catch((e) => {
    console.error(e);
    vue.$message.error(e.message);
  });
}

export async function getWBalance(vue){
  if(!vue.$CustomWeb3.account){
    return;
  }
  const wSOTE = await vue.getContract(wSOTEContract);
  const contract = wSOTE.getContract();
  contract.instance.balanceOf(vue.$CustomWeb3.account).then(response => {
    console.info("wSOTE Balance: ", response.toString());
    vue.$store.dispatch("member/setWBalance", response.toString());
  }).catch((e) => {
    console.error(e);
    vue.$message.error(e.message);
  });
}

// 给合约授权交易金额
export async function grantAllowance(vue, contractAddress, allowance){
  const SOTEToken = await vue.getContract(SOTETokenContract);
  const contract = SOTEToken.getContract();
  try{
    await contract.instance.approve(contractAddress, allowance.toString(), { from: vue.$CustomWeb3.account });
    console.info("New allowance: ", allowance.toString());
    return true;
  }catch(e){
    vue.$message.error(e.message);
  }
  return false;
}

// 查询BNB和SOTE兑换汇率
export async function getRate(vue){
  const MCR = await vue.getContract(MCRContract);
  const contract = MCR.getContract();
  try{
    const result = contract.instance.calculateTokenPrice(BNB_BYTE8);
    return result;
  }catch(e){
    vue.$message.error(`Loading member status failed. ${e.message}`);
    return false;
  }
}

// 查询BNB和美元汇率
export async function getBNBQuote(vue){
  request({
    url:`/bnb-price/`,
    method:'get',
  }).then(res => {
    console.log(res)
    vue.$store.dispatch("member/changeMember", {
      key: "bnbQuote",
      value: res.data.price
    });
  }).catch(e => {

  });
}
