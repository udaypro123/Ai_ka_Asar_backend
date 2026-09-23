import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as userService from '../services/user.service';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserProfile(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Profile retrieved', data: user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updates = req.body;
  const user = await userService.updateUserProfile(req.user!._id.toString(), updates);
  res.status(200).json({ success: true, message: 'Profile updated', data: user });
});
