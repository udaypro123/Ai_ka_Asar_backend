import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as adminService from '../services/admin.service';

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({ success: true, message: 'Dashboard stats retrieved', data: stats });
});

export const getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await adminService.getRecentActivity();
  res.status(200).json({ success: true, message: 'Recent activity retrieved', data: activity });
});

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await adminService.getAllUsers();
  res.status(200).json({ success: true, message: 'Users retrieved', data: users });
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
  }
  const user = await adminService.getUserById(userId);
  res.status(200).json({ success: true, message: 'User retrieved', data: user });
});

export const setUserBlockedStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
  }
  if (typeof req.body.isBlocked !== 'boolean') {
    throw new AppError('isBlocked must be a boolean', 400, 'INVALID_BLOCK_STATUS');
  }

  const user = await adminService.setUserBlockedStatus(userId, req.body.isBlocked);
  res.status(200).json({ success: true, message: 'User status updated', data: user });
});

export const getPublicUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const excludeUserId = req.user!._id.toString();
  const users = await adminService.getPublicUsers(excludeUserId);
  res.status(200).json({ success: true, message: 'Users retrieved', data: users });
});
