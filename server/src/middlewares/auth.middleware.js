const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/generateTokens');
const User = require('../models/user.model');

const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new AppError('Not authenticated', 401);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  next();
});

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }
  next();
};

module.exports = { isAuthenticated, isAdmin };
