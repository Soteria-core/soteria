const Decimal = require('decimal.js');

const DAI_COVER_DENYLIST = [
  // Maker DAO
  '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
];

const DEPENDANT_CONTRACTS = {
  // Curve All Pools (incl staking)
  '0x79a8c46dea5ada233abaffd40f3a0a2b1e5a4f27': [
    // Curve BTC Pools
    '0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714',
  ],
};

const MCR_CAPACITY_FACTORS = {
};

const DAYS_PER_YEAR = Decimal('365.25');

const CONTRACT_CAPACITY_LIMIT_PERCENT = Decimal('0.2');

const COVER_PRICE_SURPLUS_MARGIN = Decimal('0.3');

const CAPACITY_FACTOR = Decimal('2');

const CAPACITY_LIMIT = {
  STAKED_CAPACITY: 'STAKED_CAPACITY',
  MCR_CAPACITY: 'MCR_CAPACITY',
};

const CURRENCIES = ['BNB'];

module.exports = {
  DAI_COVER_DENYLIST,
  DEPENDANT_CONTRACTS,
  MCR_CAPACITY_FACTORS,
  DAYS_PER_YEAR,
  CONTRACT_CAPACITY_LIMIT_PERCENT,
  COVER_PRICE_SURPLUS_MARGIN,
  CAPACITY_FACTOR,
  CAPACITY_LIMIT,
  CURRENCIES,
};
