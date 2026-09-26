import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as notificationService from '../services/notification.service';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await notificationService.getNotifications(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Notifications retrieved', data: notifications });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(id!);
  res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
});
