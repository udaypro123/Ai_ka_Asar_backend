import { Router } from 'express';
import { register, login, refreshToken, logout, forgotPassword, resetPassword, verifyEmail } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';
import rateLimit from 'express-rate-limit';

const router = Router();
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(login));
router.post('/refresh', authLimiter, asyncHandler(refreshToken));
router.post('/logout', authLimiter, asyncHandler(logout));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post('/verify-email', authLimiter, asyncHandler(verifyEmail));

export default router;
