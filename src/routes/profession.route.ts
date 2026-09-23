import { Response } from 'express';
import { Router } from 'express';
import { getProfessions } from '../controllers/profession.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getProfessions);

export default router;
