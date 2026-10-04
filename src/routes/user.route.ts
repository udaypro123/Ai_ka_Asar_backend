import { Router } from 'express';
import {
  createResumeDownload,
  deleteAccount,
  downloadResume,
  downloadSharedResume,
  getProfile,
  updateProfile,
  uploadResume,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.delete('/me', authenticate, deleteAccount);
router.get('/me/resume', authenticate, downloadResume);
router.post('/me/resume', authenticate, upload.single('resume'), uploadResume);
router.get('/:userId/resume/download', authenticate, createResumeDownload);
router.get('/:userId/resume/file', downloadSharedResume);

export default router;
