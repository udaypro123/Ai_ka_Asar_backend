import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as professionService from '../services/profession.service';

export const getProfessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const professions = await professionService.getAllProfessions();
  res.status(200).json({
    success: true,
    message: 'Professions retrieved successfully',
    data: professions,
  });
});
