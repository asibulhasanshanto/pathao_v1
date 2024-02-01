const _ = require('lodash');
const { User } = require('../models/user-model');
const AppError = require('../utils/app-error');
const tokenService = require('./token-service');
const userService = require('./user-service');

const register = async (payload) => {
  // check if email is already exists
  const isExists = await userService.getOneUser({ email: payload.email });
  if (isExists) {
    throw new AppError('Email is already exists.', 400);
  }

  // Save to the database
  const user = await userService.createNewUser(_.pick(payload, ['name', 'email', 'password']));


  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  const isMatch = await user?.correctPassword(password, user.password);

  if (!isMatch) {
    throw new AppError('Incorrect email or password.', 401);
  }

  return user;
};



const updatePassword = async (currentUserId, passwordCurrent, password) => {
  // 1) Get current logged in user
  const user = await userService.getOneUser({ _id: currentUserId }).select('+password');

  // 2) Check if current password is correct
  const isMatch = await user.correctPassword(passwordCurrent, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 401);
  }

  // 3) Set the new password
  user.password = password;
  return user.save();
};


module.exports = {
  register,
  login,
  updatePassword,
};
