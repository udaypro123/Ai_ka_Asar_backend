import { Router } from 'express';
import { getProfile, updateProfile, uploadResume } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { upload, debugUpload } from '../middleware/upload';

const router = Router();

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.post('/me/resume', authenticate, debugUpload, upload.single('resume'), uploadResume);

export default router;
