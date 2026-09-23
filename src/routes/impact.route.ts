import { Router } from 'express';
import { createImpact, getMyImpacts, getImpactHistory } from '../controllers/impact.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createImpact);
router.get('/me', authenticate, getMyImpacts);
router.get('/history', authenticate, getImpactHistory);

export default router;
