const assert = require('assert');
const Decimal = require('decimal.js');

const utils = require('../../src/utils');

describe('utils', function () {
  describe('wrap()', function () {

    it('should return an array representing the wrapped string', function () {
      const input = 'abcde';
      const expected = ['ab', 'cd', 'e'];
      const actual = utils.wrap(input, 2);
      assert.deepStrictEqual(actual, expected);
    });

  });

  describe('min()', function () {

    it('should return a decimal.js instance', function () {
      const actual = utils.min(1, 2);
      assert.strict(actual instanceof Decimal);
    });

    it('should return the min of two numbers', function () {
      const actual = utils.min(1, 2);
      assert.strict(actual.eq(1));
    });

    it('should return the min of two numbers passed as string', function () {
      const actual = utils.min('1', '2');
      assert.strict(actual.eq(1));
    });

    it('should return the min of two numbers passed as decimal.js instances', function () {
      const a = Decimal(1);
      const b = Decimal(2);
      const actual = utils.min(a, b);
      assert.strict(actual.eq(1));
    });

  });

  describe('max()', function () {

    it('should return a decimal.js instance', function () {
      const actual = utils.max(1, 2);
      assert.strict(actual instanceof Decimal);
    });

    it('should return the max of two numbers', function () {
      const actual = utils.max(1, 2);
      assert.strict(actual.eq(2));
    });

    it('should return the max of two numbers passed as string', function () {
      const actual = utils.max('1', '2');
      assert.strict(actual.eq(2));
    });

    it('should return the max of two numbers passed as decimal.js instances', function () {
      const a = Decimal(1);
      const b = Decimal(2);
      const actual = utils.max(a, b);
      assert.strict(actual.eq(2));
    });

  });

});
