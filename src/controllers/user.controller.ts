import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as userService from '../services/user.service';
import { User } from '../models/User';
import fs from 'fs/promises';
import path from 'path';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserProfile(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Profile retrieved', data: user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const editableFields = [
    'name',
    'country',
    'profession',
    'industry',
    'experience',
    'employmentStatus',
    'skills',
    'careerGoal',
    'aiUsage',
    'aiImpactStatus',
    'mobile',
    'currentRole',
    'previousRole',
    'previousCompany',
    'company',
    'jobDescription',
    'linkedinUrl',
    'githubUrl',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => editableFields.includes(field))
  );
  if (Object.keys(updates).length === 0) {
    throw new AppError('No editable profile fields provided', 400, 'NO_EDITABLE_FIELDS');
  }
  const user = await userService.updateUserProfile(req.user!._id.toString(), updates);
  res.status(200).json({ success: true, message: 'Profile updated', data: user });
});

export const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE');
  }
  const user = await userService.updateUserProfile(req.user!._id.toString(), { resume: file.filename });
  res.status(200).json({
    success: true,
    message: 'Resume uploaded',
    data: { resume: `/api/${process.env.API_VERSION || 'v1'}/users/me/resume`, user },
  });
});

export const downloadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('resume');
  if (!user?.resume) {
    throw new AppError('No resume found', 404, 'RESUME_NOT_FOUND');
  }

  const uploadDirectory = path.resolve(process.cwd(), 'uploads');
  const filePath = path.resolve(uploadDirectory, path.basename(user.resume));
  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
  }
  try {
    await fs.access(filePath);
  } catch {
    throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
  }

  res.setHeader('Cache-Control', 'private, no-store');
  res.download(filePath);
});
