import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  listBadges,
  getMyBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  manualAwardBadge,
} from '../controllers/badge.controller';

const router = Router();

router.get('/', requireAuth, listBadges);
router.get('/my', requireAuth, getMyBadges);
router.post('/', requireAuth, requireRole('ADMIN'), createBadge);
router.post('/award', requireAuth, requireRole('ADMIN'), manualAwardBadge);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateBadge);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteBadge);

export default router;
