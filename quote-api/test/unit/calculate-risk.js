const assert = require('assert');
const Decimal = require('decimal.js');

const QuoteEngine = require('../../src/quote-engine');

describe('calculateRisk()', function () {

  it('calculates risk value correctly', function () {
    const inputAndExpected = [
      [1000, '48.21'],
      [2501, '40.96'],
      [5001, '34.81'],
      [7501, '30.93'],
      [10001, '28.03'],
      [15001, '23.74'],
      [22501, '19.19'],
      [32501, '14.83'],
      [60001, '7.04'],
      [77501, '3.58'],
      [97501, '2'],
      [110001, '2'],
    ];
    for (const [stakedNXM, expectedRisk] of inputAndExpected) {
      const risk = QuoteEngine.calculateRisk(Decimal(stakedNXM).mul(1e18));
      assert.strictEqual(risk.toDecimalPlaces(2).toString(), expectedRisk, `Failed for stakedNXM=${stakedNXM}`);
    }
  });
});
