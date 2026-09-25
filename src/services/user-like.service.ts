import { UserLike, User } from '../models';
import { AppError } from '../utils/appError';

export const toggleUserLike = async (userId: string, targetUserId: string) => {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const existingLike = await UserLike.findOne({ targetUserId, userId });

  if (existingLike) {
    await UserLike.findByIdAndDelete(existingLike._id);
    return { liked: false };
  }

  await UserLike.create({ targetUserId, userId });
  return { liked: true };
};

export const getUserLikes = async (targetUserId: string) => {
  const likes = await UserLike.find({ targetUserId }).lean();
  return likes.map((like: any) => like.userId.toString());
};
