import { Router } from 'express';
import {
  createPost,
  getMyPosts,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createPost);
router.get('/me', authenticate, getMyPosts);
router.get('/', authenticate, getAllPosts);
router.get('/:id', authenticate, getPostById);
router.patch('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;
