const httpContext = require('express-http-context');
const winston = require('winston');

const requestIdFormat = winston.format((info) => {
  const reqId = httpContext.get('reqId');
  return { ...info, reqId };
});

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.simple(), requestIdFormat()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple(), requestIdFormat()),
      level: 'info',
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
