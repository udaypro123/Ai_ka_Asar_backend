import { UserLike, User } from '../models';
import { UserComment } from '../models/UserComment';
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

export const getUserInteractionSummary = async (viewerId: string) => {
  const [likeCounts, commentCounts, viewerLikes] = await Promise.all([
    UserLike.aggregate([
      { $group: { _id: '$targetUserId', count: { $sum: 1 } } },
    ]),
    UserComment.aggregate([
      { $group: { _id: '$targetUserId', count: { $sum: 1 } } },
    ]),
    UserLike.find({ userId: viewerId }).select('targetUserId').lean(),
  ]);

  const summaries = new Map<string, {
    targetUserId: string;
    likeCount: number;
    commentCount: number;
    likedByMe: boolean;
  }>();

  for (const like of likeCounts) {
    const targetUserId = like._id.toString();
    summaries.set(targetUserId, {
      targetUserId,
      likeCount: like.count,
      commentCount: 0,
      likedByMe: false,
    });
  }

  for (const comment of commentCounts) {
    const targetUserId = comment._id.toString();
    const summary = summaries.get(targetUserId) || {
      targetUserId,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
    };
    summary.commentCount = comment.count;
    summaries.set(targetUserId, summary);
  }

  for (const like of viewerLikes) {
    const targetUserId = like.targetUserId.toString();
    const summary = summaries.get(targetUserId);
    if (summary) summary.likedByMe = true;
    else {
      summaries.set(targetUserId, {
        targetUserId,
        likeCount: 1,
        commentCount: 0,
        likedByMe: true,
      });
    }
  }

  return Array.from(summaries.values());
};
