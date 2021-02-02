const hex = string => '0x' + Buffer.from(string).toString('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const { isBN, toBN, toHex, toChecksumAddress } = require('web3').utils;

function getEnv (key, fallback = false) {

  const value = process.env[key] || fallback;

  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }

  return value;
}

const to = promise => new Promise(resolve => {
  promise
    .then(r => resolve([r, null]))
    .catch(e => resolve([null, e]));
});

module.exports = {
  hex,
  sleep,
  getEnv,
  to,
  isBN,
  toBN,
  toHex,
};
