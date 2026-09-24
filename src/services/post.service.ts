import { Post, Comment, Like, User } from '../models';
import { AppError } from '../utils/appError';

export const createPost = async (userId: string, data: { title: string; content: string; category?: string }) => {
  const post = await Post.create({
    userId,
    title: data.title,
    content: data.content,
    category: data.category || 'General',
  });

  const populated = await Post.findById(post._id)
    .populate('userId', 'name email roles mobile currentRole previousRole company skills')
    .lean();

  if (!populated) {
    throw new AppError('Failed to create post', 500, 'POST_CREATE_FAILED');
  }

  return {
    _id: populated._id,
    title: populated.title,
    content: populated.content,
    category: populated.category,
    likes: populated.likes || [],
    commentCount: populated.commentCount || 0,
    user: {
      _id: (populated.userId as any)?._id,
      name: (populated.userId as any)?.name,
      email: (populated.userId as any)?.email,
      roles: (populated.userId as any)?.roles || [],
      mobile: (populated.userId as any)?.mobile,
      currentRole: (populated.userId as any)?.currentRole,
      previousRole: (populated.userId as any)?.previousRole,
      company: (populated.userId as any)?.company,
      skills: (populated.userId as any)?.skills || [],
    },
    createdAt: populated.createdAt,
    updatedAt: populated.updatedAt,
  };
};

export const getMyPosts = async (userId: string) => {
  const posts = await Post.find({ userId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email roles mobile currentRole previousRole company skills')
    .lean();

  return posts.map((post) => ({
    _id: post._id,
    title: post.title,
    content: post.content,
    category: post.category,
    likes: post.likes || [],
    commentCount: post.commentCount || 0,
    user: {
      _id: (post.userId as any)?._id,
      name: (post.userId as any)?.name,
      email: (post.userId as any)?.email,
      roles: (post.userId as any)?.roles || [],
      mobile: (post.userId as any)?.mobile,
      currentRole: (post.userId as any)?.currentRole,
      previousRole: (post.userId as any)?.previousRole,
      company: (post.userId as any)?.company,
      skills: (post.userId as any)?.skills || [],
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));
};

export const getAllPosts = async () => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'name email roles mobile currentRole previousRole company skills')
    .lean();

  return posts.map((post) => ({
    _id: post._id,
    title: post.title,
    content: post.content,
    category: post.category,
    likes: post.likes || [],
    commentCount: post.commentCount || 0,
    user: {
      _id: (post.userId as any)?._id,
      name: (post.userId as any)?.name,
      email: (post.userId as any)?.email,
      roles: (post.userId as any)?.roles || [],
      mobile: (post.userId as any)?.mobile,
      currentRole: (post.userId as any)?.currentRole,
      previousRole: (post.userId as any)?.previousRole,
      company: (post.userId as any)?.company,
      skills: (post.userId as any)?.skills || [],
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));
};

export const getPostById = async (id: string) => {
  const post = await Post.findById(id)
    .populate('userId', 'name email roles mobile currentRole previousRole company skills')
    .lean();

  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  return {
    _id: post._id,
    title: post.title,
    content: post.content,
    category: post.category,
    likes: post.likes || [],
    commentCount: post.commentCount || 0,
    user: {
      _id: (post.userId as any)?._id,
      name: (post.userId as any)?.name,
      email: (post.userId as any)?.email,
      roles: (post.userId as any)?.roles || [],
      mobile: (post.userId as any)?.mobile,
      currentRole: (post.userId as any)?.currentRole,
      previousRole: (post.userId as any)?.previousRole,
      company: (post.userId as any)?.company,
      skills: (post.userId as any)?.skills || [],
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export const updatePost = async (postId: string, userId: string, data: { title?: string; content?: string; category?: string }) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  if (post.userId.toString() !== userId) {
    throw new AppError('Not authorized to update this post', 403, 'FORBIDDEN');
  }

  post.title = data.title ?? post.title;
  post.content = data.content ?? post.content;
  post.category = data.category ?? post.category;
  await post.save();

  const updated = await Post.findById(postId)
    .populate('userId', 'name email roles mobile currentRole previousRole company skills')
    .lean();

  if (!updated) {
    throw new AppError('Failed to update post', 500, 'POST_UPDATE_FAILED');
  }

  return {
    _id: updated._id,
    title: updated.title,
    content: updated.content,
    category: updated.category,
    likes: updated.likes || [],
    commentCount: updated.commentCount || 0,
    user: {
      _id: (updated.userId as any)?._id,
      name: (updated.userId as any)?.name,
      email: (updated.userId as any)?.email,
      roles: (updated.userId as any)?.roles || [],
      mobile: (updated.userId as any)?.mobile,
      currentRole: (updated.userId as any)?.currentRole,
      previousRole: (updated.userId as any)?.previousRole,
      company: (updated.userId as any)?.company,
      skills: (updated.userId as any)?.skills || [],
    },
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  if (post.userId.toString() !== userId) {
    throw new AppError('Not authorized to delete this post', 403, 'FORBIDDEN');
  }

  await Post.findByIdAndDelete(postId);
  await Comment.deleteMany({ postId });
  await Like.deleteMany({ postId });
};
