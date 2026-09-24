import { Like, Post } from '../models';
import { AppError } from '../utils/appError';

export const toggleLike = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  const existingLike = await Like.findOne({ postId, userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    post.likes = (post.likes || []).filter((id) => id.toString() !== userId);
    await post.save();
    return { liked: false, likesCount: (post.likes || []).length };
  }

  await Like.create({ postId, userId });
  if (!post.likes.includes(userId as any)) {
    post.likes = [...(post.likes || []), userId as any];
  }
  await post.save();

  return { liked: true, likesCount: (post.likes || []).length };
};
