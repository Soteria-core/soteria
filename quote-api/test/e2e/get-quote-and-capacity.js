require('dotenv').config();
const assert = require('assert');
const request = require('supertest');
const Decimal = require('decimal.js');
const { initApp } = require('../../src/app');
const { WhitelistedOrigin } = require('../../src/models');
const { getWhitelist } = require('../../src/contract-whitelist');
const { DAI_COVER_DENYLIST } = require('../../src/constants');

const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const mongoose = require('mongoose');
mongoose.Promise = Promise;

function chunk (arr, chunkSize) {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getWhitelistArr = async () => {
  const whitelistArray = [];
  const whitelist = await getWhitelist();
  for (const address of Object.keys(whitelist)) {
    if (!whitelist[address].deprecated) {
      whitelist[address] = { ...whitelist[address], address };
      whitelistArray.push(whitelist[address]);
    }
  }
  return whitelistArray;
};

describe('GET quotes', function () {
  const PORT = 3000;

  this.timeout(300000);
  let app;
  const ORIGIN = 'my_magical_origin';

  async function requestQuote (amount, currency, period, contractAddress) {
    const response = await request(app)
      .get(
        `/v1/quote?coverAmount=${amount}&currency=${currency}&period=${period}&contractAddress=${contractAddress}`,
      )
      .set({ origin: ORIGIN });
    return response;
  }

  async function requestCapacity (contractAddress) {
    const response = await request(app)
      .get(`/v1/contracts/${contractAddress}/capacity`)
      .set({ origin: ORIGIN });
    return response;
  }

  const QUOTE_SIGN_MIN_INTERVAL_MILLIS = 10000;

  before(async function () {

    const mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    const opts = { useNewUrlParser: true, useUnifiedTopology: true };
    await mongoose.connect(uri, opts);

    process.env.PROVIDER_URL = 'https://parity.nexusmutual.io';
    process.env.VERSION_DATA_URL = 'https://api.nexusmutual.io/version-data/data.json';
    process.env.NETWORK = 'mainnet';
    process.env.PRIVATE_KEY = '45571723d6f6fa704623beb284eda724459d76cc68e82b754015d6e7af794cc8';
    process.env.MONGO_URL = uri;
    process.env.CAPACITY_FACTOR_END_DATE = '08/10/2020';
    process.env.QUOTE_SIGN_MIN_INTERVAL_SECONDS = (Math.floor(QUOTE_SIGN_MIN_INTERVAL_MILLIS / 1000)).toString();

    await WhitelistedOrigin.create({ origin: ORIGIN });

    app = await initApp();
    await new Promise(resolve => app.listen(PORT, resolve));
  });

  describe('origin whitelisting', async function () {
    it('responds with 403 if the origin is not whitelisted', async function () {
      const contractAddress = '0xB27F1DB0a7e473304A5a06E54bdf035F671400C0';
      const { status } = await request(app)
        .get(`/v1/contracts/${contractAddress}/capacity`)
        .set({ origin: 'http://evilorigin.com' });
      assert.strictEqual(status, 403);
    });
  });

  describe('GET /v1/contracts/:contractAddress/capacity', async function () {
    it('responds with 200 for a production contract', async function () {
      const contractAddress = '0xB27F1DB0a7e473304A5a06E54bdf035F671400C0';

      const { status, body } = await requestCapacity(contractAddress);
      assert(Decimal(body.capacityETH).isInteger());
      assert(Decimal(body.capacityDAI).isInteger());
      assert(Decimal(body.netStakedNXM).isInteger());
      assert.strictEqual(body.capacityLimit, 'STAKED_CAPACITY');
      assert.strictEqual(status, 200);
    });

    it('responds with 200 for a production contract with a defined MCR factor', async function () {
      const contractAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

      const { status, body } = await requestCapacity(contractAddress);
      assert(Decimal(body.capacityETH).isInteger());
      assert(Decimal(body.capacityDAI).isInteger());
      assert(Decimal(body.netStakedNXM).isInteger());
      assert.strictEqual(body.capacityLimit, 'STAKED_CAPACITY');
      assert.strictEqual(status, 200);
    });
  });

  describe('GET /v1/capacities', async function () {
    it('responds with 200 when called and  with the correct number of contracts', async function () {
      const whitelist = await getWhitelist();
      const expectedCapacitiesLength = Object.keys(whitelist).length;
      const { status, body } = await request(app)
        .get(`/v1/capacities`)
        .set({ origin: ORIGIN });

      assert.strictEqual(status, 200);
      assert.strictEqual(body.length, expectedCapacitiesLength);

      const firstCapacity = body[0];
      assert(Decimal(firstCapacity.capacityETH).isInteger());
      assert(Decimal(firstCapacity.capacityDAI).isInteger());
      assert(Decimal(firstCapacity.netStakedNXM).isInteger());
      assert(firstCapacity.contractAddress);
    });
  });

  describe('GET /v1/quote', function () {
    it('responds with a valid quote for a production contract for ETH', async function () {
      const coverAmount = '1000';
      const currency = 'ETH';
      const period = 100;
      const contractAddress = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';

      const { status, body } = await requestQuote(coverAmount, currency, period, contractAddress);
      assert.strictEqual(status, 200);
      assert.strictEqual(body.currency, 'ETH');
      assert.strictEqual(body.amount, coverAmount);
      assert.strictEqual(body.contract.toLowerCase(), contractAddress.toLowerCase());
      assert.strictEqual(body.period, period.toString());
      assert(Decimal(body.price).isInteger());
      assert(Decimal(body.priceInNXM).isInteger());
      assert(Decimal(body.expiresAt).isInteger());
      assert(Decimal(body.generatedAt).isInteger());
    });

    it('responds with 429 if requested too many signatures too quickly', async function () {
      const coverAmount = '1000';
      const currency = 'ETH';
      const period = 100;
      const contractAddress = '0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F'; // Gnosis safe
      const secondContractAddress = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';

      const { status } = await requestQuote(coverAmount, currency, period, contractAddress);
      assert.strictEqual(status, 200);
      const { status: secondStatus } = await requestQuote(coverAmount, currency, period, contractAddress);
      assert.strictEqual(secondStatus, 429);

      await sleep(QUOTE_SIGN_MIN_INTERVAL_MILLIS);
      // same contract again
      const { status: thirdStatus } = await requestQuote(coverAmount, currency, period, contractAddress);
      assert.strictEqual(thirdStatus, 200);
      // unrelated contract
      const { status: fourthStatus } = await requestQuote(coverAmount, currency, period, secondContractAddress);
      assert.strictEqual(fourthStatus, 200);
    });

    it('responds with a valid quote for a production contract for DAI', async function () {
      const coverAmount = '20000';
      const currency = 'DAI';
      const period = 100;
      const contractAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'; // uniswap v2

      const { status, body } = await requestQuote(coverAmount, currency, period, contractAddress);
      assert.strictEqual(status, 200);
      assert.strictEqual(body.currency, 'DAI');
      assert.strictEqual(body.amount, coverAmount);
      assert.strictEqual(body.contract.toLowerCase(), contractAddress.toLowerCase());
      assert.strictEqual(parseInt(body.period), period);
      assert.strictEqual(isNaN(parseInt(body.price)), false);
      assert.strictEqual(isNaN(parseInt(body.priceInNXM)), false);
      assert(Decimal(body.expiresAt).isInteger());
      assert(Decimal(body.generatedAt).isInteger());
    });

    it('responds with 400 for a non-whitelisted contract', async function () {
      const coverAmount = '1000';
      const currency = 'ETH';
      const period = 100;
      const contractAddress = '0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b'; // NXM Token
      const { status } = await requestQuote(coverAmount, currency, period, contractAddress);
      assert.strictEqual(status, 400);
    });

    it('responds with 400 for contracts in DAI_COVER_DENYLIST when using DAI', async function () {
      const coverAmount = '1';
      const currency = 'DAI';
      const period = 100;
      const calls = DAI_COVER_DENYLIST.map(x => requestQuote(coverAmount, currency, period, x));
      const responses = await Promise.all(calls);
      const statuses = responses.map(x => x.status);
      statuses.forEach((status, i) => {
        assert.strictEqual(status, 400, `Failed for ${JSON.stringify(DAI_COVER_DENYLIST[i])}`);
      });
    });

    it('responds with 200 for all currently whitelisted contracts for ETH quotes', async function () {
      const whitelistArray = await getWhitelistArr();
      const ethCoverAmount = '100';
      const period = 100;

      const chunks = chunk(whitelistArray, 8);
      const results = [];
      for (const chunk of chunks) {

        await Promise.all(chunk.map(async contract => {

          const { status, body } = await requestQuote(ethCoverAmount, 'ETH', period, contract.address);
          assert.strictEqual(status, 200, `Failed for ${JSON.stringify(contract)}`);
          results.push({ ...body, ...contract });

        }));
        await sleep(QUOTE_SIGN_MIN_INTERVAL_MILLIS);
      }
      console.log(results);
    });

    it('responds with 200 for all currently whitelisted contracts not in DAI_COVER_DENYLIST for DAI quotes', async function () {
      const whitelistArray = await getWhitelistArr();
      const daiCoverAmount = '100';
      const period = 100;

      const chunks = chunk(whitelistArray, 8);
      const results = [];
      for (const chunk of chunks) {
        await Promise.all(chunk.filter(({ address }) => !DAI_COVER_DENYLIST.includes(address.toLowerCase())).map(async contract => {
          const { status, body } = await requestQuote(daiCoverAmount, 'DAI', period, contract.address);
          assert.strictEqual(status, 200, `Failed for ${JSON.stringify(contract)}`);
          results.push({ ...body, ...contract });
        }));
        await sleep(QUOTE_SIGN_MIN_INTERVAL_MILLIS);
      }
    });
  });
});
