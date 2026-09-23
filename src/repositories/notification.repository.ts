import { Notification } from '../models/Notification';

export const getNotifications = async (userId: string) =>
  Notification.find({ userId }).sort({ createdAt: -1 });
export const markAsRead = async (notificationId: string) =>
  Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
