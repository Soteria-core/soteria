const Decimal = require('decimal.js');

function wrap (text, length) {
  const regex = new RegExp(`.{1,${length}}`, 'g');
  return text.match(regex);
}

/**
 * Returns the minimum of two numbers
 * Input can be decimal.js instance, string, or number
 * @param {(Decimal|string|number)} a
 * @param {(Decimal|string|number)} b
 * @return {Decimal}
 */
function min (a, b) {
  const bigA = Decimal(a);
  const bigB = Decimal(b);
  return bigA.lt(bigB) ? bigA : bigB;
}

/**
 * Returns maximum of two decimal.js numbers
 * @param {(Decimal|string|number)} a
 * @param {(Decimal|string|number)} b
 * @return {Decimal}
 */
function max (a, b) {
  const decimalA = Decimal(a);
  const decimalB = Decimal(b);
  return decimalA.gt(decimalB) ? decimalA : decimalB;
}

const hex = string => '0x' + Buffer.from(string).toString('hex');

function getEnv (key, fallback = false) {

  const value = process.env[key] || fallback;

  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }

  return value;
}

module.exports = {
  wrap,
  min,
  max,
  hex,
  getEnv,
};
