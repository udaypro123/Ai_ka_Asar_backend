import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
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
