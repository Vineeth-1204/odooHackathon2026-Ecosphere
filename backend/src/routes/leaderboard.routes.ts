import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getEmployeeLeaderboard,
  getDepartmentLeaderboard,
  getMyRank,
} from '../controllers/leaderboard.controller';

const router = Router();

router.get('/employees', requireAuth, getEmployeeLeaderboard);
router.get('/departments', requireAuth, getDepartmentLeaderboard);
router.get('/my-rank', requireAuth, getMyRank);

export default router;
