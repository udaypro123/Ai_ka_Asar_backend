import mongoose from 'mongoose';
import { Comment, Post } from '../models';
import { AppError } from '../utils/appError';

export const createComment = async (
  userId: string,
  userName: string,
  data: { postId: string; content: string; parentCommentId?: string }
) => {
  const post = await Post.findById(data.postId);
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  let parentCommentId: mongoose.Types.ObjectId | null = null;
  if (data.parentCommentId) {
    const parent = await Comment.findOne({
      _id: data.parentCommentId,
      postId: data.postId,
    });
    if (!parent) {
      throw new AppError('Parent comment not found for this post', 404, 'PARENT_COMMENT_NOT_FOUND');
    }
    parentCommentId = parent._id;
  }

  const comment = await Comment.create({
    postId: data.postId,
    userId,
    parentCommentId,
    userName,
    content: data.content,
  });

  post.commentCount = (post.commentCount || 0) + 1;
  await post.save();

  return {
    _id: comment._id,
    postId: comment.postId,
    userId: comment.userId,
    parentCommentId: comment.parentCommentId?.toString() ?? null,
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
    parentCommentId: comment.parentCommentId?.toString() ?? null,
    userName: comment.userName,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
};
