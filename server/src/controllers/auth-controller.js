const authService = require('../services/auth-service');
const tokenService = require('../services/token-service');
const { validateRider, validateDriver, validateUpdatePassword } = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res, next) => {
    if (req.body?.role === 'driver') {
        var { error } = validateDriver(req.body);
    } else {
        var { error } = validateRider(req.body);
    }
    if (error) return next(new AppError(error.details[0].message, 400));

    const user = await authService.register(req.body);
    // remove the key and value password from the user object
    delete user.password;
    
    if (user.role === 'driver') {
        res.status(201).json({
            status: 'success',
            data: {
                user,
            },
        });
    } else {
        const token = tokenService.generateJwtToken({ id: user._id });
        res.status(201).json({
            status: 'success',
            data: {
                user,
                token,
            },
        });
    }
});

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password is required.', 400));
    }

    const user = await authService.login(email, password);
    const token = tokenService.generateJwtToken({ id: user._id });

    res.status(200).json(token);
});

const updatePassword = catchAsync(async (req, res, next) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { passwordCurrent, password } = req.body;

    const user = await authService.updatePassword(req.user.id, passwordCurrent, password);
    const token = tokenService.generateJwtToken({ id: user._id });

    res.status(200).json(token);
});

module.exports = {
    register,
    login,
    updatePassword,
};
