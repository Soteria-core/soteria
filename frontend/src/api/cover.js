import request from '@/utils/request'
import QuotationDataContract from '@/services/QuotationData';
import { BigNumber } from 'bignumber.js'

export const getCoverContracts = async (vue) => {
  const [contractsRes, capacitiesRes] = await Promise.all([
    request({
      url: `/data/contracts.json?nocache=${new Date().getTime()}`,
      method: 'get'
    }),
    request({
      url: `/quote-api/capacities`,
      method: 'get'
    })
  ])
  const capacities = capacitiesRes.data || [];
  contractsRes.data.forEach((item) => {
    const capacity = capacities.find(val => item.address.toUpperCase() === val.contractAddress.toUpperCase())
    if (capacity) {
      item.capacityBNB = vue.$etherToNumber(capacity.capacityBNB)
    }
  })
  return contractsRes
}

// 查询保险报价
export const getQuote = (params) => {
  return request({
    url: `/quote-api/quote`,
    method: 'get',
    params: params
  })
}

export const loadCover = async (vue, cid, isUpdate, contracts)=>{
  const QuotationData = await vue.getContract(QuotationDataContract);
  const instance = QuotationData.getContract().instance; 
  console.info("读取cover");
  const cacheKey = "member_cover_" + cid;
  let cover = vue.getObjectCache(cacheKey);
  if(cover){
    if(isUpdate){
      const status = await instance.getCoverStatusNo(cid.toString());
      cover.status = status.toString();
    }
    cover.isCache = true;
    cover.contract = cover.contract ? cover.contract : contracts.find(item=>item.address.toLowerCase() == cover.scAddress.toString().toLowerCase());
    console.info("完成cover from cache");
    return cover;
  }
  const [nonStatusCover, statusCover] = await Promise.all([
    instance.getCoverDetailsByCoverID1(cid.toString()),
    instance.getCoverDetailsByCoverID2(cid.toString())
  ])
  cover = {
    cid: statusCover.cid.toString(),
    sumAssured: statusCover.sumAssured.toString(),
    coverPeriod: statusCover.coverPeriod.toString(),
    validUntil: statusCover.validUntil.toString(),
    purchase: (parseInt(statusCover.validUntil.toString()) - parseInt(statusCover.coverPeriod.toString()) * 24 * 60 * 60),
    status: statusCover.status.toString(),
    premiumNXM: nonStatusCover.premiumNXM.toString(),
    currencyCode: nonStatusCover._currencyCode.toString(),
    scAddress: nonStatusCover._scAddress.toString(),
    memberAddress: nonStatusCover._memberAddress.toString(),
  }
  cover.contract = contracts ? contracts.find(item=>item.address.toLowerCase() == cover.scAddress.toString().toLowerCase()) : null;
  
  vue.cacheObject(cacheKey, cover);
  console.info("完成cover");
  return cover;
}
