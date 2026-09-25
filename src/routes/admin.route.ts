import { Router } from 'express';
import { getDashboardStats, getRecentActivity, getAllUsers, getUserById, getPublicUsers } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { RoleType } from '../models/Role';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'HR'), getDashboardStats);
router.get('/recent-activity', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'HR'), getRecentActivity);
router.get('/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'HR'), getAllUsers);
router.get('/users/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'HR'), getUserById);
router.get('/public/users', authenticate, getPublicUsers);

export default router;
