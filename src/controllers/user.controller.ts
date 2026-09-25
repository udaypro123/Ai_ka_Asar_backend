import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as userService from '../services/user.service';
import { upload } from '../middleware/upload';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserProfile(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Profile retrieved', data: user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updates = req.body;
  const user = await userService.updateUserProfile(req.user!._id.toString(), updates);
  res.status(200).json({ success: true, message: 'Profile updated', data: user });
});

export const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file;
  console.log('[uploadResume] req.file:', file ? { filename: file.filename, originalname: file.originalname, mimetype: file.mimetype, size: file.size } : null);
  if (!file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE');
  }
  const resumePath = `/uploads/${file.filename}`;
  const user = await userService.updateUserProfile(req.user!._id.toString(), { resume: resumePath });
  console.log('[uploadResume] user updated with resume:', resumePath);
  res.status(200).json({ success: true, message: 'Resume uploaded', data: { resume: resumePath, user } });
});
