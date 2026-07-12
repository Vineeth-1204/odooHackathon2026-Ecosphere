import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  listCSRActivities,
  getCSRActivity,
  createCSRActivity,
  updateCSRActivity,
  deleteCSRActivity,
} from '../controllers/csr.controller';
import {
  joinCSRActivity,
  uploadCSRProof,
  getMyParticipations,
  getCSRParticipations,
  getAllParticipations,
  approveParticipation,
  rejectParticipation,
} from '../controllers/participation.controller';

const router = Router();

// ── CSR Activities ───────────────────────────────────
router.get('/', requireAuth, listCSRActivities);
router.get('/participations/all', requireAuth, requireRole('ADMIN', 'MANAGER'), getAllParticipations);
router.get('/participations/my', requireAuth, getMyParticipations);
router.get('/:id', requireAuth, getCSRActivity);
router.post('/', requireAuth, createCSRActivity);
router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), updateCSRActivity);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteCSRActivity);

// ── CSR Participation ────────────────────────────────
router.post('/:id/join', requireAuth, joinCSRActivity);
router.post('/:id/upload-proof', requireAuth, upload.single('proof'), uploadCSRProof);
router.get('/:id/participations', requireAuth, requireRole('ADMIN', 'MANAGER'), getCSRParticipations);
router.put('/participations/:id/approve', requireAuth, requireRole('ADMIN', 'MANAGER'), approveParticipation);
router.put('/participations/:id/reject', requireAuth, requireRole('ADMIN', 'MANAGER'), rejectParticipation);

export default router;
