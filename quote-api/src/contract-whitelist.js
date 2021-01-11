const NodeCache = require('node-cache');
const fetch = require('node-fetch');
const log = require('./log');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const WHITELIST_KEY = 'whitelist';

async function getWhitelist () {

  let whitelist = cache.get(WHITELIST_KEY);
  if (!whitelist) {
    whitelist = {};
    const data = await fetch('https://api.nexusmutual.io/coverables/contracts.json').then(res => res.json());
    for (const address of Object.keys(data)) {
      if (!data[address].deprecated) {
        const contractData = data[address];
        delete data[address];
        whitelist[address.toLowerCase()] = contractData;
      }
    }
    cache.set(WHITELIST_KEY, whitelist);
    log.info(`Fetched and cached whitelist of length: ${Object.keys(whitelist).length}`);
  }
  return whitelist;
}

module.exports = {
  getWhitelist,
};
