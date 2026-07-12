import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { awardRewardPoints, awardXP } from '../services/xp.service';

// ── JOIN CSR Activity (Employee) ────────────────────
export const joinCSRActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const csrActivityId = Number(req.params.id);
    const userId = req.user!.id;

    const activity = await prisma.cSRActivity.findUnique({ where: { id: csrActivityId } });
    if (!activity || activity.status !== 'ACTIVE') {
      res.status(400).json({ success: false, message: 'Activity not available for joining' });
      return;
    }

    // Check max participants
    if (activity.maxParticipants) {
      const count = await prisma.participation.count({ where: { csrActivityId } });
      if (count >= activity.maxParticipants) {
        res.status(400).json({ success: false, message: 'Activity is full' });
        return;
      }
    }

    const participation = await prisma.participation.upsert({
      where: { userId_csrActivityId: { userId, csrActivityId } },
      update: {},
      create: { userId, csrActivityId },
    });

    res.status(201).json({ success: true, data: participation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPLOAD PROOF for CSR (Employee) ─────────────────
export const uploadCSRProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const csrActivityId = Number(req.params.id);
    const userId = req.user!.id;

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const proofUrl = `/uploads/${req.file.filename}`;

    const participation = await prisma.participation.update({
      where: { userId_csrActivityId: { userId, csrActivityId } },
      data: { proofUrl, status: 'PENDING' },
    });

    res.json({ success: true, data: participation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET MY CSR Participations (Employee) ────────────
export const getMyParticipations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const participations = await prisma.participation.findMany({
      where: { userId },
      include: { csrActivity: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: participations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ALL Participations for a CSR Activity (Admin) ─
export const getCSRParticipations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const csrActivityId = Number(req.params.id);
    const { status } = req.query;

    const participations = await prisma.participation.findMany({
      where: {
        csrActivityId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, departmentId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: participations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ALL Participations across all activities (Admin) ─
export const getAllParticipations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, userId } = req.query;
    const participations = await prisma.participation.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(userId ? { userId: Number(userId) } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        csrActivity: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: participations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── APPROVE CSR Participation (Admin/Manager) ────────
export const approveParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const participation = await prisma.participation.findUnique({
      where: { id },
      include: { csrActivity: true },
    });
    if (!participation) {
      res.status(404).json({ success: false, message: 'Participation not found' });
      return;
    }

    const pointsToAward = participation.csrActivity.pointsReward;

    await prisma.participation.update({
      where: { id },
      data: { status: 'APPROVED', pointsAwarded: pointsToAward, completedAt: new Date() },
    });

    // Award reward points
    await awardRewardPoints(participation.userId, pointsToAward);

    res.json({ success: true, message: `Approved. ${pointsToAward} points awarded.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── REJECT CSR Participation (Admin/Manager) ─────────
export const rejectParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { rejectionNote } = req.body;

    await prisma.participation.update({
      where: { id },
      data: { status: 'REJECTED', rejectionNote },
    });

    res.json({ success: true, message: 'Participation rejected' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── JOIN CHALLENGE (Employee) ────────────────────────
export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challengeId = Number(req.params.id);
    const userId = req.user!.id;

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge || challenge.status !== 'ACTIVE') {
      res.status(400).json({ success: false, message: 'Challenge not available for joining' });
      return;
    }

    const participation = await prisma.challengeParticipation.upsert({
      where: { userId_challengeId: { userId, challengeId } },
      update: {},
      create: { userId, challengeId },
    });

    res.status(201).json({ success: true, data: participation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE CHALLENGE PROGRESS + PROOF (Employee) ────
export const updateChallengeProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const { progress } = req.body;

    const proofUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const participation = await prisma.challengeParticipation.update({
      where: { id },
      data: {
        ...(progress !== undefined && { progress: Math.min(100, Number(progress)) }),
        ...(proofUrl && { proofUrl }),
        status: 'PENDING',
      },
    });

    // Verify ownership
    if (participation.userId !== userId) {
      res.status(403).json({ success: false, message: 'Not your participation' });
      return;
    }

    res.json({ success: true, data: participation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET MY Challenge Participations (Employee) ───────
export const getMyChallengeParticipations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const participations = await prisma.challengeParticipation.findMany({
      where: { userId },
      include: { challenge: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: participations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ALL Challenge Submissions for a Challenge (Admin) ─
export const getChallengeSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challengeId = Number(req.params.id);
    const { status } = req.query;

    const submissions = await prisma.challengeParticipation.findMany({
      where: {
        challengeId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── APPROVE Challenge Participation (Admin/Manager) ──
export const approveChallengeParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const participation = await prisma.challengeParticipation.findUnique({
      where: { id },
      include: { challenge: true },
    });
    if (!participation) {
      res.status(404).json({ success: false, message: 'Participation not found' });
      return;
    }

    const xpToAward = participation.challenge.xpValue;

    await prisma.challengeParticipation.update({
      where: { id },
      data: { status: 'APPROVED', xpAwarded: xpToAward, completedAt: new Date() },
    });

    // Award XP — this also triggers badge auto-check
    await awardXP(participation.userId, xpToAward);

    res.json({ success: true, message: `Approved. ${xpToAward} XP awarded.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── REJECT Challenge Participation (Admin/Manager) ───
export const rejectChallengeParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { rejectionNote } = req.body;

    await prisma.challengeParticipation.update({
      where: { id },
      data: { status: 'REJECTED', rejectionNote },
    });

    res.json({ success: true, message: 'Challenge participation rejected' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
