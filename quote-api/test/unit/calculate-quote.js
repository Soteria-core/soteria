const assert = require('assert');
const Decimal = require('decimal.js');
const { to2Decimals } = require('./testing-utils');
const QuoteEngine = require('../../src/quote-engine');

const LegacyQuoteReason = {
  UNCOVERABLE: 'Uncoverable',
  CAPACITY_LIMIT_EXCEEDED: 'capacityLimitExceed',
  OK: 'ok',
};
const quoteValidity = 300;

describe('calculateQuote()', function () {
  describe('respects input values and returns correct timestamps', function () {

    const ethDAIRate = Decimal(233);
    const amount = Decimal('1000');
    const currency = 'DAI';
    const period = 365.25;
    const nxmPrice = Decimal('10000000000000000'); // 1 NXM = 0.01 ETH (2.5 DAI)
    const stakedNxm = Decimal('6000000000000000000000'); // 6000 NXM
    const minCapETH = Decimal('10000000000000000000000'); // 10000 ETH
    const now = new Date(Date.parse('21 Jan 2020 06:00:00 UTC'));
    const activeCovers = [];
    const currencyRates = {
      ETH: Decimal('1e18'),
      DAI: Decimal('1e18').div(ethDAIRate),
    };
    const capacityFactor = Decimal('1');
    const mcrCapacityFactor = Decimal('1');

    let quoteData;
    it('calculates quoteData succesfully', function () {
      quoteData = QuoteEngine.calculateQuote(
        amount, period, currency, nxmPrice, stakedNxm, minCapETH, activeCovers, currencyRates, now, capacityFactor, mcrCapacityFactor,
      );
    });

    it('returns a cover amount less or equal to the requested amount', function () {
      assert.strict(quoteData.amount.lte(amount));
    });

    it('returns a cover period equal to the requested period', function () {
      assert.strictEqual(quoteData.period, period, 'Returned cover period differs from requested period');
    });

    it('returns the same cover currency', function () {
      assert.strictEqual(quoteData.currency, currency);
    });

    it('returns correct generation time', function () {
      assert.strictEqual(now.getTime(), quoteData.generatedAt);
    });

    it('returns correct expiration time', function () {
      assert.strictEqual(Math.ceil(now.getTime() / 1000 + quoteValidity), quoteData.expiresAt);
    });
  });

  describe('calculates ETH quotes correctly', function () {

    const ethDAIRate = Decimal(233);
    const nxmPriceDAI = Decimal(4).mul('1e18');
    const nxmPrice = nxmPriceDAI.div(ethDAIRate);
    const minCapETH = Decimal(13500).mul('1e18');
    const now = new Date(Date.parse('21 Jan 2020 06:00:00 UTC'));
    const currency = 'ETH';
    const currencyRates = {
      ETH: Decimal('1e18'),
      DAI: Decimal('1e18').div(ethDAIRate),
    };
    const capacityFactor = Decimal('1');
    const mcrCapacityFactor = Decimal('1');

    function assertETHAndNXMPrices (
      amount, period, stakedNxm, activeCovers, expectedPriceInETH, expectedPriceInNXM, expectedCoverAmountOffered
    ) {

      const quoteData = QuoteEngine.calculateQuote(
        amount, period, currency, nxmPrice, stakedNxm, minCapETH, activeCovers, currencyRates, now, capacityFactor, mcrCapacityFactor,
      );
      assert.strictEqual(
        to2Decimals(quoteData.price),
        to2Decimals(expectedPriceInETH),
      );
      assert.strictEqual(
        to2Decimals(quoteData.priceInNXM),
        to2Decimals(expectedPriceInNXM),
      );
      assert.strictEqual(
        to2Decimals(quoteData.amount),
        to2Decimals(expectedCoverAmountOffered),
      );
    }

    it('returns the cover price in ETH and NXM for 1000 cover and no current active covers', function () {
      const amount = Decimal('1000');
      const period = 365.25;
      const stakedNxm = Decimal(120000).mul('1e18');
      const expectedPriceInETH = Decimal('26').mul('1e18');
      const expectedPriceInNXM = Decimal('1514.5').mul('1e18');
      const expectedCoverAmountOffered = amount;
      const activeCovers = [];
      assertETHAndNXMPrices(
        amount, period, stakedNxm, activeCovers, expectedPriceInETH, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.OK,
      );
    });

    it('returns the cover price in ETH and NXM for 230 cover and no current active covers', function () {
      const amount = Decimal('230');
      const period = 100;
      const stakedNxm = Decimal(240000).mul('1e18');
      const expectedPriceInETH = Decimal('1.64').mul('1e18');
      const expectedPriceInNXM = Decimal('95.37').mul('1e18');
      const expectedCoverAmountOffered = amount;
      const activeCovers = [];
      assertETHAndNXMPrices(
        amount, period, stakedNxm, activeCovers, expectedPriceInETH, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.OK,
      );
    });

    it('returns the cover price in ETH and NXM for 5000 cover exceeding global capacity', function () {
      const amount = Decimal('5000');
      const period = 365.25;
      const stakedNxm = Decimal(220000).mul('1e18');
      const expectedPriceInETH = Decimal('70.2').mul('1e18');
      const expectedPriceInNXM = Decimal('4089.15').mul('1e18');
      const expectedCoverAmountOffered = Decimal('2700');
      const activeCovers = [];
      assertETHAndNXMPrices(
        amount, period, stakedNxm, activeCovers, expectedPriceInETH, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.CAPACITY_LIMIT_EXCEEDED,
      );
    });

    it(`returns 'uncoverable' for 0 stake`, function () {
      const amount = Decimal('1000');
      const period = 365.25;
      const stakedNxm = Decimal(0);
      const activeCovers = [];
      const quoteData = QuoteEngine.calculateQuote(
        amount, period, currency, nxmPrice, stakedNxm, minCapETH, activeCovers, currencyRates, now,
      );
      assert.strictEqual(quoteData.error, LegacyQuoteReason.UNCOVERABLE);
      assert.strictEqual(now.getTime(), quoteData.generatedAt);
      assert.strictEqual(Math.ceil(now.getTime() / 1000 + quoteValidity), quoteData.expiresAt);
    });

    it('returns the cover price in ETH and NXM for 1000 cover and current active covers', function () {
      const amount = Decimal('1000');
      const period = 365.25;
      const stakedNxm = Decimal(120000).mul('1e18').add(nxmPrice.mul('1000'));
      const expectedPriceInETH = Decimal('26').mul('1e18');
      const expectedPriceInNXM = Decimal('1514.5').mul('1e18');
      const expectedCoverAmountOffered = amount;
      const activeCovers = [
        { sumAssured: Decimal('500'), currency: 'ETH' },
        { sumAssured: Decimal('500').mul(ethDAIRate), currency: 'DAI' },
      ];
      assertETHAndNXMPrices(
        amount, period, stakedNxm, activeCovers, expectedPriceInETH, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.OK,
      );
    });
  });

  describe('calculates DAI quotes correctly', function () {

    const ethDAIRate = Decimal(233);
    const nxmPriceDAI = Decimal(4).mul('1e18');
    const nxmPrice = nxmPriceDAI.div(ethDAIRate);
    const minCapETH = Decimal(13500).mul('1e18');
    const now = new Date(Date.parse('21 Jan 2020 06:00:00 UTC'));
    const currency = 'DAI';
    const activeCovers = [];
    const currencyRates = {
      ETH: Decimal('1e18'),
      DAI: Decimal('1e18').div(ethDAIRate),
    };
    const capacityFactor = Decimal('1');
    const mcrCapacityFactor = Decimal('1');

    function assertETHAndNXMPrices (
      amount, period, stakedNxm, expectedPriceInETH, expectedPriceInNXM, expectedCoverAmountOffered,
    ) {

      const quoteData = QuoteEngine.calculateQuote(
        amount, period, currency, nxmPrice, stakedNxm, minCapETH, activeCovers, currencyRates, now, capacityFactor, mcrCapacityFactor,
      );
      assert.strictEqual(
        to2Decimals(quoteData.price),
        to2Decimals(expectedPriceInETH),
      );
      assert.strictEqual(
        to2Decimals(quoteData.priceInNXM),
        to2Decimals(expectedPriceInNXM),
      );
      assert.strictEqual(
        to2Decimals(quoteData.amount),
        to2Decimals(expectedCoverAmountOffered),
      );
    }

    it('returns the cover price in DAI and NXM for 800000 cover exceeding global capacity', function () {
      const amount = Decimal('800000');
      const period = 365.25;
      const stakedNxm = Decimal('800000').mul('1e18');
      const expectedPriceInDAI = Decimal('16356.6').mul('1e18');
      const expectedPriceInNXM = Decimal('4089.15').mul('1e18');
      const expectedCoverAmountOffered = Decimal('629100');
      assertETHAndNXMPrices(
        amount, period, stakedNxm, expectedPriceInDAI, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.CAPACITY_LIMIT_EXCEEDED,
      );
    });

    it('returns the cover price in DAI and NXM for 50000 cover', function () {
      const amount = Decimal('50000');
      const period = 365.25;
      const stakedNxm = Decimal('20000').mul('1e18');
      const expectedPriceInDAI = Decimal('7975.07').mul('1e18');
      const expectedPriceInNXM = Decimal('1993.77').mul('1e18');
      const expectedCoverAmountOffered = amount;
      assertETHAndNXMPrices(
        amount, period, stakedNxm, expectedPriceInDAI, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.OK,
      );
    });

    it('returns the cover price in DAI and NXM for 150000 cover exceeding staking capacity limit', function () {
      const amount = Decimal('150000');
      const period = 100;
      const stakedNxm = Decimal('20000').mul('1e18');
      const expectedPriceInDAI = Decimal('3493.53').mul('1e18');
      const expectedPriceInNXM = Decimal('873.38').mul('1e18');
      const expectedCoverAmountOffered = Decimal('80000');
      assertETHAndNXMPrices(
        amount, period, stakedNxm, expectedPriceInDAI, expectedPriceInNXM, expectedCoverAmountOffered, LegacyQuoteReason.CAPACITY_LIMIT_EXCEEDED,
      );
    });
  });

});
