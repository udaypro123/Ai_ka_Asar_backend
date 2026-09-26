import { Router } from 'express';
import { downloadResume, getProfile, updateProfile, uploadResume } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.get('/me/resume', authenticate, downloadResume);
router.post('/me/resume', authenticate, upload.single('resume'), uploadResume);

export default router;
