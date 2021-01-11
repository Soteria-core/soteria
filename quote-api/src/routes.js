const express = require('express');
const uuid = require('uuid');
const { WhitelistedOrigin } = require('./models');
const log = require('./log');
const QuoteEngine = require('./quote-engine');
const { getWhitelist } = require('./contract-whitelist');
const httpContext = require('express-http-context');
const { DAI_COVER_DENYLIST } = require('./constants');

const asyncRoute = route => (req, res) => {
  route(req, res).catch(e => {
    log.error(`Route error: ${e.stack}`);
    if (e.status) {
      res.status(e.status).send({
        error: true,
        message: e.message,
      });
    } else {
      res.status(500).send({
        error: true,
        message: 'Internal server error',
      });
    }
  });
};

/**
 * @param {QuoteEngine} quoteEngine
 * @return {app}
 */
module.exports = quoteEngine => {

  const app = express();

  // use context for request id logging.
  app.use(httpContext.middleware);
  // Run the context for each request. Assign a unique identifier to each request
  app.use((req, res, next) => {
    httpContext.set('reqId', uuid.v1());
    next();
  });

  app.use((req, res, next) => {
    log.info(`${req.method} ${req.originalUrl}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'x-api-key');
    next();
  });

  app.use(async (req, res, next) => {

    const origin = req.get('origin');
    const isAllowed = await isOriginAllowed(origin);

    if (!isAllowed) {
      return res.status(403).send({
        error: true,
        message: 'Origin not allowed. Contact us for an API key',
      });
    }
    next();
  });

  app.get('/v1/quote', asyncRoute(async (req, res) => {

    const coverAmount = req.query.coverAmount;
    const currency = req.query.currency;
    const period = req.query.period;
    const contractAddress = req.query.contractAddress;

    const { error } = QuoteEngine.validateQuoteParameters(
      contractAddress,
      coverAmount,
      currency,
      period,
    );
    if (error) {
      log.error(`Invalid parameters provided: ${error}`);
      return res.status(400).send({
        error: true,
        message: error,
      });
    }
    const whitelist = await getWhitelist();
    const contractData = whitelist[contractAddress.toLowerCase()];
    if (!contractData) {
      const message = `Contract ${contractAddress} not on whitelist`;
      log.error(message);
      return res.status(400).send({
        error: true,
        message,
      });
    }

    if (currency === 'DAI' && DAI_COVER_DENYLIST.includes(contractAddress.toLowerCase())) {
      const message = `Cover for contract ${contractAddress} doesn't allow DAI as a currency`;
      return res.status(400).send({
        error: true,
        message,
      });
    }

    const quote = await quoteEngine.getQuote(
      contractAddress,
      coverAmount,
      currency,
      period,
      contractData,
    );

    res.send(prettyPrintResponse(quote));
  }));

  app.get('/v1/contracts/:contractAddress/capacity', asyncRoute(async (req, res) => {

    const { contractAddress } = req.params;
    QuoteEngine.validateCapacityParameters();

    const { error } = QuoteEngine.validateCapacityParameters(contractAddress);

    if (error) {
      log.error(`Invalid parameters provided: ${error}`);
      return res.status(400).send({
        error: true,
        message: error,
      });
    }

    const whitelist = await getWhitelist();
    const contractData = whitelist[contractAddress.toLowerCase()];
    if (!contractData) {
      const message = `Contract ${contractAddress} not on whitelist.`;
      log.error(message);
      return res.status(400).send({
        reason: 'Uncoverable',
        coverAmount: 0,
      });
    }

    const capacity = await quoteEngine.getCapacity(contractAddress, contractData);

    res.send(prettyPrintCapacityResponse(capacity));
  }));

  app.get('/v1/capacities', asyncRoute(async (req, res) => {

    const capacities = await quoteEngine.getCapacities();
    res.send(capacities.map(capacity => {
      return { ...prettyPrintCapacityResponse(capacity), contractAddress: capacity.contractAddress };
    }));
  }));

  return app;
};

async function isOriginAllowed (origin) {

  if (/\.nexusmutual\.io$/.test(origin)) {
    return true;
  }
  const storedApiKey = await WhitelistedOrigin.findOne({ origin });

  return storedApiKey !== null;
}

function prettyPrintResponse (r) {
  const prettyResponse = {
    ...r,
    amount: r.amount.toFixed(0),
    price: r.price.toFixed(0),
    priceInNXM: r.priceInNXM.toFixed(0),
    period: r.period.toString(),
  };
  return prettyResponse;
}

function prettyPrintCapacityResponse (r) {
  const prettyResponse = {
    capacityETH: r.capacityETH.toFixed(0),
    capacityDAI: r.capacityDAI.toFixed(0),
    netStakedNXM: r.netStakedNXM.toFixed(0),
    capacityLimit: r.capacityLimit,
  };
  return prettyResponse;
}
