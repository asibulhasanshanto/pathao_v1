const { createLogger, format, transports } = require('winston');
const { developmentLogger } = require('./development');
const { productionLogger } = require('./production');

const environment = process.env.NODE_ENV || 'production';
 const logger = environment === 'development' ? developmentLogger : productionLogger;
module.exports = {
    logger,
}