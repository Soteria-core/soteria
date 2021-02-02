const fetch = require('node-fetch');
const log = require('./log');
const { to } = require('./utils');

const SPEED = {
  SAFE_LOW: 'safeLow',
  STANDARD: 'standard',
  ABOVE_STANDARD: 'aboveStandard',
  FAST: 'fast',
  FASTEST: 'fastest',
};

const GWEI_IN_WEI = 1e9;
const ETHERCHAIN_URL = 'https://www.etherchain.org/api/gasPriceOracle';
const ETHGASSTATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json';

/**
 * Fetches gas prices from Etherchain with fallback to EthGasStation if the first fails
 * @return {Promise<{standard: number, fast: number, fastest: number, safeLow: number}>}
 */
const fetchGasPrices = async () => {

  const [ecPrice, ecError] = await to(fetch(ETHERCHAIN_URL).then(r => r.json()));

  if (!ecError) {
    return {
      fastest: parseFloat(ecPrice.fastest),
      fast: parseFloat(ecPrice.fast),
      standard: parseFloat(ecPrice.standard),
      safeLow: parseFloat(ecPrice.safeLow),
    };
  }

  log.error(`Failed to fetch Etherchain price data, using EthGasStation as a fallback: ${ecError.stack}`);

  const [egsPrice, egsError] = await to(fetch(ETHGASSTATION_URL).then(r => r.json()));

  if (egsError) {
    log.error(`Failed to fetch EthGasStation: ${egsError.stack}`);
    throw new Error('Gas price fetching failed');
  }

  return {
    fastest: egsPrice.fastest / 10,
    fast: egsPrice.fast / 10,
    standard: egsPrice.average / 10,
    safeLow: egsPrice.safeLow / 10,
  };
};

/**
 * Returns a recommended gas price considering the requested speed and upper limit
 * @param speed {string}
 * @return {Promise<number>}
 */
const getGasPrice = async (speed) => {
  const prices = await fetchGasPrices();
  prices[SPEED.ABOVE_STANDARD] = getAboveStandardPrice(prices);
  log.info(JSON.stringify(prices));
  const { [speed]: price } = prices;

  if (!price) {
    throw new Error(`No gas price found for '${speed}' speed`);
  }

  return Math.round(price * GWEI_IN_WEI);
};

function getAboveStandardPrice (prices) {
  return Math.floor((prices.fast + prices.standard)) / 2;
}

module.exports = {
  getGasPrice,
  SPEED,
};
