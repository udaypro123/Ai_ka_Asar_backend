import { Router } from 'express';
import { createUserComment, getUserComments } from '../controllers/user-comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createUserComment);
router.get('/:userId', authenticate, getUserComments);

export default router;
