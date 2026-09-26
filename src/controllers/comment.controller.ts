import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as commentService from '../services/comment.service';

export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await commentService.createComment(req.user!._id.toString(), req.user!.name, req.body);
  res.status(201).json({ success: true, message: 'Comment added', data: comment });
});

export const getComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comments = await commentService.getComments(req.params.postId!);
  res.status(200).json({ success: true, message: 'Comments retrieved', data: comments });
});
