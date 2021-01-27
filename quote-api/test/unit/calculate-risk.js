const assert = require('assert');
const Decimal = require('decimal.js');

const QuoteEngine = require('../../src/quote-engine');

describe('calculateRisk()', function () {

  it('calculates risk value correctly', function () {
    const inputAndExpected = [
      [1000, '42.81'],
      [2501, '34.81'],
      [5001, '28.03'],
      [7501, '23.74'],
      [10001, '20.54'],
      [15001, '15.8'],
      [22501, '10.78'],
      [32501, '5.97'],
      [60001, '2'],
      [77501, '2'],
      [97501, '2'],
      [110001, '2'],
    ];
    for (const [stakedNXM, expectedRisk] of inputAndExpected) {
      const risk = QuoteEngine.calculateRisk(Decimal(stakedNXM).mul(1e18));
      assert.strictEqual(risk.toDecimalPlaces(2).toString(), expectedRisk, `Failed for stakedNXM=${stakedNXM}`);
    }
  });
});
