const userRouter = require('../routes/user-routes');
const authRouter = require('../routes/auth-routes');
const riderRouter = require('../routes/rider-routes');
const driverRouter = require('../routes/driver-routes');
const tripRouter = require('../routes/trip-routes');
const globalErrorHandler = require('../controllers/error-controller');
const AppError = require('../utils/app-error');

module.exports = (app) => {
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/users', userRouter);
    app.use('/api/v1/riders', riderRouter);
    app.use('/api/v1/drivers', driverRouter);
    app.use('/api/v1/trips', tripRouter);

    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.method} ${req.originalUrl} on this server.`, 404));
    });

    app.use(globalErrorHandler);
};
