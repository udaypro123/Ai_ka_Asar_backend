import { Router } from 'express';
import { getJourney, updateJourney, getRecommendations } from '../controllers/career.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/journey', authenticate, getJourney);
router.patch('/journey', authenticate, updateJourney);
router.get('/recommendations', authenticate, getRecommendations);

export default router;
