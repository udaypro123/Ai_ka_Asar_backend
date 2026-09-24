import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as likeService from '../services/like.service';

export const toggleLike = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await likeService.toggleLike(req.user!._id.toString(), req.body.postId);
  res.status(200).json({ success: true, message: result.liked ? 'Post liked' : 'Post unliked', data: result });
});
