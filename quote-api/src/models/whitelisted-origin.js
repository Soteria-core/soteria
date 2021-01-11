const mongoose = require('mongoose');
const { WHITELISTED_ORIGIN_COLLECTION } = process.env;

const whitelistedOrigin = new mongoose.Schema({
  origin: String,
});

module.exports = mongoose.model('WhitelistedOrigin', whitelistedOrigin, WHITELISTED_ORIGIN_COLLECTION);
