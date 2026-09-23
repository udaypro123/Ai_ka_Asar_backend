import { User } from '../models/User';
import { CareerProfile } from '../models/CareerProfile';

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const careerProfile = await CareerProfile.findOne({ userId });
  return { ...user.toObject(), careerProfile };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};
