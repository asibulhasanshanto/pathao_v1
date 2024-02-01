const _ = require('lodash');
const userService = require('../services/user-service');
const { validateUser, validateUserUpdate } = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Privae(admin)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await userService.getAllUsers();

  res.status(200).json(allUsers);
});

/**
 * @desc    Get single user
 * @route   GET /api/users/id
 * @access  Privae(admin)
 */
const getOneUser = catchAsync(async (req, res, next) => {
  const user = await userService.getOneUser({ _id: req.params.id });
  if (!user) return next(new AppError('No user found with this id.', 404));

  res.status(200).json(user);
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Privae(admin)
 */
const createNewUser = catchAsync(async (req, res, next) => {
  const { error } = validateUser(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const payload = _.pick(req.body, ['name', 'email', 'password', 'avatar', 'role']);
  const newUser = await userService.createNewUser(payload);

  res.status(201).json(newUser);
});

/**
 * @desc    Update single user
 * @route   PATCH /api/users/id
 * @access  Privae(admin)
 */
const updateOneUser = catchAsync(async (req, res, next) => {
  const { error } = validateUserUpdate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const payload = _.pick(req.body, ['name', 'email', 'avatar', 'role', 'emailVerifiedAt']);
  const updateUser = await userService.updateOneUser({ _id: req.params.id }, payload);
  if (!updateUser) return next(new AppError('No user found with this id.', 404));

  res.status(200).json(updateUser);
});

/**
 * @desc    Delete single user
 * @route   PATCH /api/users/id
 * @access  Privae(admin)
 */
const deleteOneUser = catchAsync(async (req, res, next) => {
  const deleteUser = await userService.deleteOneUser({ _id: req.params.id });
  if (!deleteUser) return next(new AppError('No user found with this id.', 404));

  res.status(204).send();
});

/**
 * @desc    Update current user data
 * @route   PATCH /api/users/update-me
 * @access  Private
 */
const updateMe = catchAsync(async (req, res, next) => {
  const { error } = validateUserUpdate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const payload = _.pick(req.body, ['name', 'email', 'avatar']);
  const updateUser = await userService.updateOneUser({ _id: req.user.id }, payload);

  res.status(200).json(updateUser);
});

/**
 * @desc    Get current user profile data
 * @route   GET /api/users/my-profile
 * @access  Private
 */
const getMyProfile = catchAsync(async (req, res, next) => {
  const profile = await userService.getOneUser({ _id: req.user.id });

  res.status(200).json(profile);
});

module.exports = {
  getAllUsers,
  getOneUser,
  createNewUser,
  updateOneUser,
  deleteOneUser,
  updateMe,
  getMyProfile,
};
