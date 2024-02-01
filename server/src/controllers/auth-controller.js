const authService = require('../services/auth-service');
const tokenService = require('../services/token-service');
const { validateRider, validateDriver, validateUpdatePassword } = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const otpService = require('../services/otp-service');
const userService = require('../services/user-service');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
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
    var data = {};
    if (user.role === 'driver') {
        data = {
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        };
    } else {
        const token = tokenService.generateJwtToken({ id: user._id });
        data = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            token,
        };
    }

    res.status(201).json({
        status: 'success',
        data,
    });
});

/**
 * @desc    Login a user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password is required.', 400));
    }

    const user = await authService.login(email, password);
    const token = tokenService.generateJwtToken({ id: user._id });

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            token,
        },
    });
});

const updatePassword = catchAsync(async (req, res, next) => {
    const { error } = validateUpdatePassword(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { passwordCurrent, password } = req.body;

    const user = await authService.updatePassword(req.user.id, passwordCurrent, password);
    const token = tokenService.generateJwtToken({ id: user._id });

    res.status(200).json(token);
});

const driverLoginOTP = catchAsync(async (req, res, next) => {
    const { phone } = req.body;

    if (!phone) {
        return next(new AppError('Phone is required.', 400));
    }

    // Validate phone number using regex for Bangladesh
    const regex = /^\+8801[3-9]{1}[0-9]{8}$/;

    if (!regex.test(phone)) {
        return next(new AppError('Invalid phone number.', 400));
    }

    const user = await userService.getOneUser({ phone });
    if (!user) {
        return next(new AppError('Invalid Phone number', 400));
    }

    if (user.role !== 'driver') {
        return next(new AppError('You are not a driver.', 400));
    }

    const otp = otpService.generateOTP();
    // await otpService.sendOTP(phone, otp);

    const expires = Date.now() + process.env.OTP_EXPIRES_IN * 60 * 1000;
    const data = `${phone}.${otp}.${expires}`;
    const hash = otpService.hashOTP(data);

    res.status(200).json({
        hash: `${hash}.${expires}`,
        otp, // For testing purpose
    });
});

const driverLogin = catchAsync(async (req, res, next) => {
    const { phone, otp, hash } = req.body;

    if (!otp || !hash || !phone) {
        return next(new AppError('OTP is required.', 400));
    }

    const [hashedOtp, expires] = hash.split('.');
    if (Date.now() > expires) {
        return next(new AppError('OTP has expired.', 400));
    }

    const data = `${phone}.${otp}.${expires}`;
    const isValid = otpService.verifyOTP(hashedOtp, data);
    if (!isValid) {
        return next(new AppError('OTP is invalid.', 400));
    }

    const user = await authService.driverLogin(phone);
    const token = tokenService.generateJwtToken({ id: user._id });

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
            token,
        },
    });
});
module.exports = {
    register,
    login,
    updatePassword,
    driverLoginOTP,
    driverLogin,
};
