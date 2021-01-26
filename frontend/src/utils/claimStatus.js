import { BigNumber } from 'bignumber.js';

export const STATUS = {
  CA_PENDING: 0,
  CA_DENIED_MV_PENDING: 1,
  CA_ACCEPTED_BUT_BELOW_THRESHOLD_MV_PENDING: 2,
  CA_DENIED_BUT_BELOW_THRESHOLD_MV_PENDING: 3,
  CA_ACCEPTED_BUT_NO_CONSENSUS_MV_PENDING: 4,
  CA_DENIED_BUT_NO_CONSENSUS_MV_PENDING: 5,
  CA_DENIED: 6,
  CA_ACCEPTED: 7,
  CA_DENIED_MV_ACCEPTED: 8,
  CA_DENIED_MV_DENIED: 9,
  CA_ACCEPTED_MV_NO_DECISION: 10,
  CA_DENIED_MV_NO_DECISION: 11,
  CA_ACCEPTED_PENDING_PAYOUT: 12,
  CA_ACCEPTED_NO_PAYOUT: 13,
  CA_PAYOUT_COMPLETE: 14,
}

export const MV_PENDING_STATUS_LIST = [
  STATUS.CA_DENIED_MV_PENDING,
  STATUS.CA_ACCEPTED_BUT_BELOW_THRESHOLD_MV_PENDING,
  STATUS.CA_DENIED_BUT_BELOW_THRESHOLD_MV_PENDING,
  STATUS.CA_ACCEPTED_BUT_NO_CONSENSUS_MV_PENDING,
  STATUS.CA_DENIED_BUT_NO_CONSENSUS_MV_PENDING,
];

export const PENDING_STATUS_LIST = [
  STATUS.CA_PENDING,
  ...MV_PENDING_STATUS_LIST,
];

export const DENIED_STATUS_LIST = [
  STATUS.CA_DENIED,
  STATUS.CA_DENIED_MV_DENIED,
  STATUS.CA_DENIED_MV_NO_DECISION,
];

export const statusFormatForMember = (data) => {
  if (PENDING_STATUS_LIST.includes(parseInt(data.status))) {
    return {
      status: 'Pending',
      tagType: 'blue'
    };
  }
  if (DENIED_STATUS_LIST.includes(parseInt(data.status))) {
      return {
        status: 'Denied',
        tagType: 'danger'
      };
  }
  return {
    status: 'Accepted',
    tagType: 'success'
  };
}

export const statusFormat = (data) => {
  if (BigNumber(data.status).eq(STATUS.CA_PENDING)) {
    if (BigNumber(data.caVoteId).gt(0)) {
      return {
        status: 'Already assessed',
        tagType: 'info'
      };
    }
    return {
      status: 'Open to assessors',
      tagType: 'warning'
    };
  }
  if (MV_PENDING_STATUS_LIST.includes(parseInt(data.status))) {
    if(parseInt(data.status) == 3){
      const curTime = new Date().getTime();
      const expireTime = BigNumber(data.dateUpd).plus(data.maxVotingTime).times(1000);
      if(expireTime.lt(curTime)){
        return  {
          status: 'Denied',
          tagType: 'danger'
        };
      }
    }
    if (BigNumber(data.mvVoteId).gt(0)) {
      return {
        status: 'Already assessed',
        tagType: 'info'
      };
    }
    return {
      status: 'Open to all members',
      tagType: 'warning'
    };
  }
  if (DENIED_STATUS_LIST.includes(parseInt(data.status))) {
      return {
        status: 'Denied',
        tagType: 'danger'
      };
  }
  return {
    status: 'Accepted',
    tagType: 'success'
  };
}
