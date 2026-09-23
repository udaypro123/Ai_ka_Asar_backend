import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as impactService from '../services/impact.service';

export const createImpact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await impactService.createImpactReport(req.user!._id.toString(), req.body);
  res.status(201).json({ success: true, message: 'Impact report created', data: report });
});

export const getMyImpacts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reports = await impactService.getMyImpactReports(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Impact reports retrieved', data: reports });
});

export const getImpactHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const history = await impactService.getImpactHistory(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Impact history retrieved', data: history });
});
