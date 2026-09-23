import { Router } from 'express';
import { getSkills, getMySkills, updateMySkill } from '../controllers/skill.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getSkills);
router.get('/me', authenticate, getMySkills);
router.patch('/me/:skillId', authenticate, updateMySkill);

export default router;
