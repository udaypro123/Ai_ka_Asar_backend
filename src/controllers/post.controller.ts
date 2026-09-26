import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as postService from '../services/post.service';

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await postService.createPost(req.user!._id.toString(), req.body);
  res.status(201).json({ success: true, message: 'Post created', data: post });
});

export const getMyPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const posts = await postService.getMyPosts(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Posts retrieved', data: posts });
});

export const getAllPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const posts = await postService.getAllPosts();
  res.status(200).json({ success: true, message: 'Posts retrieved', data: posts });
});

export const getPostById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await postService.getPostById(req.params.id!);
  res.status(200).json({ success: true, message: 'Post retrieved', data: post });
});

export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await postService.updatePost(req.params.id!, req.user!._id.toString(), req.body);
  res.status(200).json({ success: true, message: 'Post updated', data: post });
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  await postService.deletePost(req.params.id!, req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Post deleted' });
});
