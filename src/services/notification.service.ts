import { Notification } from '../models/Notification';

export const getNotifications = async (userId: string) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId: string) => {
  return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};
