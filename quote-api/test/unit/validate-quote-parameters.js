const assert = require('assert');

const QuoteEngine = require('../../src/quote-engine');

describe('validateQuoteParameters()', function () {
  const validAddress = '0x2c2bc2cde905b29494cbd485657dae8a95f30ec8';
  it('validates correct ETH input values as valid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, '1000', 'ETH', '365');
    assert.strictEqual(error, undefined);

  });

  it('validates correct DAI input values as valid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, '1000', 'DAI', '30');
    assert.strictEqual(error, undefined);
  });

  it('validates incorrect address as invalid', function () {
    const { error } = QuoteEngine.validateQuoteParameters('BLA' + validAddress, '1000', 'ETH', '45');
    assert.strictEqual(error.name, 'ValidationError');
  });

  it('validates incorrect amount as invalid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, 'abc', 'ETH', '45');
    assert.strictEqual(error.name, 'ValidationError');
  });
  it('validates incorrect fractional amount as invalid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, '125.5', 'ETH', '45');
    assert.strictEqual(error.name, 'ValidationError');
  });

  it('validates incorrect negative amount as invalid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, '-125', 'ETH', '45');
    assert.strictEqual(error.name, 'ValidationError');
  });

  it('validates incorrect currency as invalid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, '1000', 'BLA', '45');
    assert.strictEqual(error.name, 'ValidationError');
  });

  it('validates incorrect period as invalid', function () {
    const { error } = QuoteEngine.validateQuoteParameters(validAddress, '1000', 'DAI', '366');
    assert.equal(error.name, 'ValidationError');
  });
});
