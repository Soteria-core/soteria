function to2Decimals (weiValue) {
  return weiValue.div('1e18').toDecimalPlaces(2).toFixed();
}

module.exports = {
  to2Decimals,
};
