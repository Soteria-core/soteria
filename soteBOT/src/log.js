const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.simple(), winston.format.timestamp()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple(), winston.format.timestamp()),
      level: 'info',
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
