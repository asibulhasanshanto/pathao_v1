const dotenv = require('dotenv');
const { httpServer } = require('./app');
dotenv.config({ path: `${__dirname}/config.env` });
const { logger } = require('./logger');

process.on('uncaughtException', (err) => {
    console.log('ERROR LOG:', err.message);
    console.log('UncaughtException');
    logger.on('error', () => {
        process.exit(1);
    });
});

const PORT = process.env.PORT || 5000;

const server = httpServer.listen(PORT, () => {
    logger.info(`API is listening in [${process.env.NODE_ENV}] on port ${PORT}`);
});
require('./startup/db')();

process.on('unhandledRejection', (err) => {
    console.log('ERROR LOG:', err.message);
    console.log('🔥 UnhandledRejection.Sutting down....');
    logger.error(err.message, err);

    server.close(() => {
        process.exit(1);
    });
});
