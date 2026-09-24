import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log("resister function enter ", req.body)
  const { name, email, password, role } = req.body;
  const result = await authService.registerUser({ name, email, password, role });
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
  });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401, 'REFRESH_TOKEN_REQUIRED');
  }
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken: result.accessToken, refreshToken: result.refreshToken },
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
    data: { resetToken: result.resetToken },
  });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.status(200).json({ success: true, message: 'Password reset successfully' });
});

export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  await authService.verifyEmail(token);
  res.status(200).json({ success: true, message: 'Email verified successfully' });
});
