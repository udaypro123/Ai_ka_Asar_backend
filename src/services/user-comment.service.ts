import mongoose from 'mongoose';
import { UserComment, User } from '../models';
import { AppError } from '../utils/appError';

export const createUserComment = async (
  userId: string,
  userName: string,
  data: { targetUserId: string; content: string; parentCommentId?: string }
) => {
  const targetUser = await User.findById(data.targetUserId);
  if (!targetUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  let parentCommentId: mongoose.Types.ObjectId | null = null;
  if (data.parentCommentId) {
    const parent = await UserComment.findOne({
      _id: data.parentCommentId,
      targetUserId: data.targetUserId,
    });
    if (!parent) {
      throw new AppError('Parent comment not found for this profile', 404, 'PARENT_COMMENT_NOT_FOUND');
    }
    parentCommentId = parent._id;
  }

  const comment = await UserComment.create({
    targetUserId: data.targetUserId,
    userId,
    parentCommentId,
    userName,
    content: data.content,
  });

  return {
    _id: comment._id,
    targetUserId: comment.targetUserId,
    userId: comment.userId,
    parentCommentId: comment.parentCommentId?.toString() ?? null,
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

  return comments.map((comment) => ({
    _id: comment._id,
    targetUserId: comment.targetUserId,
    userId: comment.userId,
    parentCommentId: comment.parentCommentId?.toString() ?? null,
    userName: comment.userName,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
};
