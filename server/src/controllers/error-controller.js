const AppError = require('../utils/app-error');
const { logger } = require('../logger');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;

    return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
    const fieldName = `${Object.keys(err.keyPattern)}`;
    const message = `${err.keyValue[fieldName]} ${fieldName} already exists`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;

    return new AppError(message, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid token! Please login again.', 400);
};

const handleJWTExpiredError = () => {
    return new AppError('Token has expired. Please login again.', 401);
};

const handleFileUploadError = () => {
    return new AppError('Image Upload failed. Please try again.', 400);
};

const sendErrorDev = (err, req, res) => {
    // console.error('ERROR LOG:', err);
    logger.error(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, req, res) => {
    // console.error('ERROR LOG:', err);
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        logger.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        if (req.file) error = handleFileUploadError();
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErrorProd(error, req, res);
    } else if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
};
