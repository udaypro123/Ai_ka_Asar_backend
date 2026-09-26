import { Router } from 'express';
import { toggleUserLike, getUserLikes, getUserInteractionSummary } from '../controllers/user-like.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/summary', authenticate, getUserInteractionSummary);
router.post('/:userId', authenticate, toggleUserLike);
router.get('/:userId', authenticate, getUserLikes);

export default router;
