import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import * as skillService from '../services/skill.service';

export const getSkills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skills = await skillService.getAllSkills();
  res.status(200).json({ success: true, message: 'Skills retrieved', data: skills });
});

export const getMySkills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const skills = await skillService.getMySkills(req.user!._id.toString());
  res.status(200).json({ success: true, message: 'Skills retrieved', data: skills });
});

export const updateMySkill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skillId } = req.params;
  const { level } = req.body;
  if (typeof level !== 'number') {
    throw new AppError('Level is required', 400, 'VALIDATION_ERROR');
  }
  const skill = await skillService.updateSkill(req.user!._id.toString(), skillId!, level);
  res.status(200).json({ success: true, message: 'Skill updated', data: skill });
});
