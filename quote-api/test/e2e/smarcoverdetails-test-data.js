
function covers () {
  const expiresAt = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredAt = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

  const activeQuoteETH = {
    smartContractAdd: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
    sumAssured: 1000,
    expiry: expiresAt,
    expirytimeStamp: expiresAt.getTime() / 1000,
    statusNum: 0,
    premium: 4004106776181000000,
    premiumNXM: 242673137950363650000,
    curr: 'ETH',
    lockCN: null,
    coverId: 280,
    blockNumber: 9889622,
    coverCreation: Date('2020-04-17T11:23:13Z'),
    timestamp: 1587122593,
    version: 'M1',
  };
  const activeQuoteDAI = {
    smartContractAdd: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
    sumAssured: 5000,
    expiry: expiresAt,
    expirytimeStamp: expiresAt.getTime() / 1000,
    statusNum: 0,
    premium: 4004106776181000000,
    premiumNXM: 242673137950363650000,
    curr: 'ETH',
    lockCN: null,
    coverId: 280,
    blockNumber: 9889622,
    coverCreation: Date('2020-04-17T11:23:13Z'),
    timestamp: 1587122593,
    version: 'M1',
  };

  const expiredQuote = {
    smartContractAdd: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
    sumAssured: 500,
    expiry: expiredAt,
    expirytimeStamp: expiredAt.getTime() / 1000,
    statusNum: 0,
    premium: 4004106776181000000,
    premiumNXM: 242673137950363650000,
    curr: 'ETH',
    lockCN: null,
    coverId: 280,
    blockNumber: 9889622,
    coverCreation: Date('2020-04-17T11:23:13Z'),
    timestamp: 1587122593,
    version: 'M1',
  };

  const covers = [activeQuoteETH, activeQuoteDAI, expiredQuote];
  return covers;
}

module.exports = {
  covers,
};
