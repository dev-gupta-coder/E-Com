const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateTokens');

const ACCESS_COOKIE_MAX_AGE = 30 * 60 * 1000; // matches accessToken JWT expiry (30m)
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // matches refreshToken JWT expiry (7d)

const isProduction = process.env.NODE_ENV === 'production';

// SameSite=None is required for cross-site cookies (client and server are on
// different domains in production), but browsers reject SameSite=None unless
// Secure is also set. Locally, client and server share "localhost" as their
// site (port doesn't count), so Lax without Secure works fine over plain HTTP.
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

const ACCESS_COOKIE_OPTIONS = { ...BASE_COOKIE_OPTIONS, maxAge: ACCESS_COOKIE_MAX_AGE };
const REFRESH_COOKIE_OPTIONS = { ...BASE_COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE };

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Email already registered', 409);
    }
    throw err;
  }

  setAuthCookies(res, generateAccessToken(user._id), generateRefreshToken(user._id));

  res.status(201).json({ success: true, user: toPublicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  setAuthCookies(res, generateAccessToken(user._id), generateRefreshToken(user._id));

  res.status(200).json({ success: true, user: toPublicUser(user) });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new AppError('Not authenticated', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  res.cookie('accessToken', generateAccessToken(user._id), ACCESS_COOKIE_OPTIONS);

  res.status(200).json({ success: true });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken', BASE_COOKIE_OPTIONS);
  res.clearCookie('refreshToken', BASE_COOKIE_OPTIONS);
  res.status(200).json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: toPublicUser(req.user) });
});

module.exports = { register, login, refresh, logout, me };
