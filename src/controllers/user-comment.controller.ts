import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as userCommentService from '../services/user-comment.service';

export const createUserComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await userCommentService.createUserComment(req.user!._id.toString(), req.user!.name, {
    ...req.body,
    targetUserId: req.body.targetUserId,
  });
  res.status(201).json({ success: true, message: 'Comment added', data: comment });
});

export const getUserComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comments = await userCommentService.getUserComments(req.params.userId!);
  res.status(200).json({ success: true, message: 'Comments retrieved', data: comments });
});
