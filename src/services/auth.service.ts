import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { sendPasswordResetEmail } from './email.service';

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    roles: ['USER'],
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
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked', 403, 'ACCOUNT_BLOCKED');
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await storeRefreshToken(user._id.toString(), refreshToken);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const storedToken = await RefreshToken.findOneAndDelete({
    token: tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  const user = await User.findById(decoded.userId);
  if (!user || user.isBlocked) {
    await RefreshToken.deleteMany({ userId: decoded.userId });
    throw new AppError(
      user ? 'Your account has been blocked' : 'User not found',
      user ? 403 : 401,
      user ? 'ACCOUNT_BLOCKED' : 'USER_NOT_FOUND'
    );
  }
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

  await storeRefreshToken(decoded.userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

export const revokeRefreshToken = async (token: string) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await RefreshToken.findOneAndDelete({ token: tokenHash });
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.error('Password reset email delivery failed');
  }
};

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  await RefreshToken.deleteMany({ userId: user._id });
};

export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

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
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
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

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await RefreshToken.create({ userId, token: tokenHash, expiresAt });
};
