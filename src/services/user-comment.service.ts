import { UserComment, User } from '../models';
import { AppError } from '../utils/appError';

export const createUserComment = async (userId: string, userName: string, data: { targetUserId: string; content: string }) => {
  const targetUser = await User.findById(data.targetUserId);
  if (!targetUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const comment = await UserComment.create({
    targetUserId: data.targetUserId,
    userId,
    userName,
    content: data.content,
  });

  return {
    _id: comment._id,
    targetUserId: comment.targetUserId,
    userId: comment.userId,
    userName: comment.userName,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

export const getUserComments = async (targetUserId: string) => {
  const comments = await UserComment.find({ targetUserId })
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((comment: any) => ({
    _id: comment._id,
    targetUserId: comment.targetUserId,
    userId: comment.userId,
    userName: comment.userName,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
};
