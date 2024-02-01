const _ = require('lodash');
const userService = require('../services/user-service');
const { validateUser, validateUserUpdate } = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

/**
 * @desc    Update current user data
 * @route   PATCH /api/v1/users/update-me
 * @access  Private
 */
const updateMe = catchAsync(async (req, res, next) => {
    const { error } = validateUserUpdate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const payload = _.pick(req.body, ['name', 'email']);
    const updateUser = await userService.updateOneUser({ _id: req.user.id }, payload);

    res.status(200).json(updateUser);
});

/**
 * @desc    Get current user profile data
 * @route   GET /api/v1/users/my-profile
 * @access  Private
 */
const getMyProfile = catchAsync(async (req, res, next) => {
    const profile = await userService.getOneUser({ _id: req.user.id });

    res.status(200).json(profile);
});

module.exports = {
    updateMe,
    getMyProfile,
};
