import { Comment, Post } from '../models';
import { AppError } from '../utils/appError';

export const createComment = async (userId: string, userName: string, data: { postId: string; content: string }) => {
  const post = await Post.findById(data.postId);
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  const comment = await Comment.create({
    postId: data.postId,
    userId,
    userName,
    content: data.content,
  });

  post.commentCount = (post.commentCount || 0) + 1;
  await post.save();

  return {
    _id: comment._id,
    postId: comment.postId,
    userId: comment.userId,
    userName: comment.userName,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

export const getComments = async (postId: string) => {
  const comments = await Comment.find({ postId })
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((comment) => ({
    _id: comment._id,
    postId: comment.postId,
    userId: comment.userId,
    userName: comment.userName,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
};
