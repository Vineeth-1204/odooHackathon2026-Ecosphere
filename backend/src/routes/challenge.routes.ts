import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  listChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  advanceChallengeStatus,
  archiveChallenge,
} from '../controllers/challenge.controller';
import {
  joinChallenge,
  updateChallengeProgress,
  getMyChallengeParticipations,
  getChallengeSubmissions,
  approveChallengeParticipation,
  rejectChallengeParticipation,
} from '../controllers/participation.controller';

const router = Router();

// ── Challenges ───────────────────────────────────────
router.get('/', requireAuth, listChallenges);
router.get('/participation/my', requireAuth, getMyChallengeParticipations);
router.get('/:id', requireAuth, getChallenge);
router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), createChallenge);
router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), updateChallenge);
router.put('/:id/status', requireAuth, requireRole('ADMIN', 'MANAGER'), advanceChallengeStatus);
router.delete('/:id', requireAuth, requireRole('ADMIN'), archiveChallenge);

// ── Challenge Participation ──────────────────────────
router.post('/:id/join', requireAuth, joinChallenge);
router.put('/participation/:id/progress', requireAuth, upload.single('proof'), updateChallengeProgress);
router.get('/:id/submissions', requireAuth, requireRole('ADMIN', 'MANAGER'), getChallengeSubmissions);
router.put('/participation/:id/approve', requireAuth, requireRole('ADMIN', 'MANAGER'), approveChallengeParticipation);
router.put('/participation/:id/reject', requireAuth, requireRole('ADMIN', 'MANAGER'), rejectChallengeParticipation);

export default router;
