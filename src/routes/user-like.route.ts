import { Router } from 'express';
import { toggleUserLike, getUserLikes } from '../controllers/user-like.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:userId', authenticate, toggleUserLike);
router.get('/:userId', authenticate, getUserLikes);

export default router;
