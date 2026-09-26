import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as userLikeService from '../services/user-like.service';

export const toggleUserLike = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userLikeService.toggleUserLike(req.user!._id.toString(), req.params.userId!);
  res.status(200).json({ success: true, message: result.liked ? 'User liked' : 'User unliked', data: result });
});

export const getUserLikes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const likes = await userLikeService.getUserLikes(req.params.userId!);
  res.status(200).json({ success: true, message: 'Likes retrieved', data: likes });
});

export const getUserInteractionSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await userLikeService.getUserInteractionSummary(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'User interactions retrieved', data: summary });
});
