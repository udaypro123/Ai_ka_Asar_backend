import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as userService from '../services/user.service';
import { User } from '../models/User';
import fs from 'fs/promises';
import path from 'path';
import {
  createResumeDownloadUrl,
  verifyLocalResumeDownloadToken,
} from '../services/cloudinary.service';
import { env } from '../config/env';

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
    'privacySettings',
    'notificationPreferences',
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => editableFields.includes(field))
  );
  if (updates.privacySettings !== undefined) {
    const settings = updates.privacySettings as Record<string, unknown>;
    if (!settings || typeof settings.profileDiscoverable !== 'boolean') {
      throw new AppError('Invalid privacy settings', 400, 'INVALID_PRIVACY_SETTINGS');
    }
    updates.privacySettings = { profileDiscoverable: settings.profileDiscoverable };
  }
  if (updates.notificationPreferences !== undefined) {
    const preferences = updates.notificationPreferences as Record<string, unknown>;
    if (
      !preferences ||
      typeof preferences.email !== 'boolean' ||
      typeof preferences.sms !== 'boolean' ||
      typeof preferences.whatsapp !== 'boolean'
    ) {
      throw new AppError('Invalid notification preferences', 400, 'INVALID_NOTIFICATION_PREFERENCES');
    }
    updates.notificationPreferences = {
      email: preferences.email,
      sms: preferences.sms,
      whatsapp: preferences.whatsapp,
    };
  }
  if (Object.keys(updates).length === 0) {
    throw new AppError('No editable profile fields provided', 400, 'NO_EDITABLE_FIELDS');
  }
  const user = await userService.updateUserProfile(req.user!._id.toString(), updates);
  res.status(200).json({ success: true, message: 'Profile updated', data: user });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  await userService.deleteUserAccount(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Account deleted' });
});

export const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE');
  }
  const user = await userService.saveUserResume(req.user!._id.toString(), {
    buffer: file.buffer,
    originalname: file.originalname,
  });
  res.status(200).json({
    success: true,
    message: 'Resume uploaded',
    data: { resume: `/api/${env.API_VERSION}/users/me/resume`, user },
  });
});

export const downloadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('resume resumePublicId');
  if (!user?.resume) {
    throw new AppError('No resume found', 404, 'RESUME_NOT_FOUND');
  }

  if (user.resumePublicId) {
    const downloadUrl = createResumeDownloadUrl(user.resumePublicId, user.resume);
    res.setHeader('Cache-Control', 'private, no-store');
    res.redirect(302, downloadUrl);
    return;
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

export const createResumeDownload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const downloadUrl = await userService.getResumeDownloadUrl(
    req.user!._id.toString(),
    req.user!.roles,
    req.params.userId!
  );
  res.status(200).json({
    success: true,
    message: 'Resume download link created',
    data: { downloadUrl },
  });
});

export const downloadSharedResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!verifyLocalResumeDownloadToken(userId!, token)) {
    throw new AppError('Resume download link is invalid or expired', 401, 'INVALID_RESUME_DOWNLOAD_LINK');
  }

  const user = await User.findById(userId).select('resume resumePublicId');
  if (!user?.resume) throw new AppError('No resume found', 404, 'RESUME_NOT_FOUND');
  if (user.resumePublicId) {
    res.redirect(302, createResumeDownloadUrl(user.resumePublicId, user.resume));
    return;
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
