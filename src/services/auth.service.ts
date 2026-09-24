import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export const registerUser = async (data: { name: string; email: string; password: string; role?: string }) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const role = data.role === 'HR' ? 'HR' : 'USER';
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    roles: [role],
  });

  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await storeRefreshToken(user._id.toString(), refreshToken);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await storeRefreshToken(user._id.toString(), refreshToken);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  const storedToken = await RefreshToken.findOne({ token });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

  await RefreshToken.findByIdAndDelete(storedToken._id);
  await storeRefreshToken(decoded.userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

export const revokeRefreshToken = async (token: string) => {
  await RefreshToken.findOneAndDelete({ token });
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { resetToken: null };
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  return { resetToken };
};

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
};

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  const maxAge = parseInt(env.JWT_REFRESH_EXPIRY) || 7;
  if (env.JWT_REFRESH_EXPIRY.includes('d')) {
    expiresAt.setDate(expiresAt.getDate() + maxAge);
  } else {
    expiresAt.setHours(expiresAt.getHours() + maxAge);
  }

  await RefreshToken.create({ userId, token, expiresAt });
};
