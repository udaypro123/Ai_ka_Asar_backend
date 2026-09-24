import { Router } from 'express';
import { toggleLike } from '../controllers/like.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, toggleLike);

export default router;
