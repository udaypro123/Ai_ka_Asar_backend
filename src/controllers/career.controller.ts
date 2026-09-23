import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as careerService from '../services/career.service';

export const getJourney = asyncHandler(async (req: AuthRequest, res: Response) => {
  const journey = await careerService.getCareerJourney(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Career journey retrieved', data: journey });
});

export const updateJourney = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { milestones } = req.body;
  if (!Array.isArray(milestones)) {
    throw new AppError('Milestones must be an array', 400, 'VALIDATION_ERROR');
  }
  const journey = await careerService.updateCareerJourney(req.user!._id.toString(), milestones);
  res.status(200).json({ success: true, message: 'Career journey updated', data: journey });
});

export const getRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const recommendations = await careerService.getRecommendations(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Recommendations retrieved', data: recommendations });
});
