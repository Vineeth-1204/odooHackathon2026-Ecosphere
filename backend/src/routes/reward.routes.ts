import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  listRewards,
  getReward,
  createReward,
  updateReward,
  archiveReward,
  redeemRewardHandler,
  getMyRedemptions,
  getAllRedemptions,
} from '../controllers/reward.controller';

const router = Router();

router.get('/', requireAuth, listRewards);
router.get('/redemptions/my', requireAuth, getMyRedemptions);
router.get('/redemptions', requireAuth, requireRole('ADMIN', 'MANAGER'), getAllRedemptions);
router.get('/:id', requireAuth, getReward);
router.post('/', requireAuth, requireRole('ADMIN'), createReward);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateReward);
router.delete('/:id', requireAuth, requireRole('ADMIN'), archiveReward);
router.post('/:id/redeem', requireAuth, redeemRewardHandler);

export default router;
