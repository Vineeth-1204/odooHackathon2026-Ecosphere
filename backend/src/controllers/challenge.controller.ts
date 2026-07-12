import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ── LIST Challenges ──────────────────────────────────
export const listChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, difficulty, categoryId, search } = req.query;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'MANAGER';

    const challenges = await prisma.challenge.findMany({
      where: {
        // Employees only see ACTIVE challenges by default
        ...(status
          ? { status: status as any }
          : !isAdmin ? { status: 'ACTIVE' } : {}),
        ...(difficulty ? { difficulty: difficulty as any } : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        ...(search ? { title: { contains: String(search), mode: 'insensitive' } } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: challenges });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET single Challenge ────────────────────────────
export const getChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { participations: true } },
      },
    });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    // If employee, also fetch their participation
    let myParticipation = null;
    if (req.user) {
      myParticipation = await prisma.challengeParticipation.findUnique({
        where: { userId_challengeId: { userId: req.user.id, challengeId: id } },
      });
    }

    res.json({ success: true, data: { ...challenge, myParticipation } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE Challenge (Admin/Manager) ────────────────
export const createChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, categoryId, xpValue, difficulty, evidenceRequired, deadline } = req.body;

    if (!title || !categoryId) {
      res.status(400).json({ success: false, message: 'title and categoryId are required' });
      return;
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        categoryId: Number(categoryId),
        xpValue: xpValue ? Number(xpValue) : 50,
        difficulty: difficulty || 'MEDIUM',
        evidenceRequired: evidenceRequired === true || evidenceRequired === 'true',
        deadline: deadline ? new Date(deadline) : null,
        status: 'DRAFT',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE Challenge (Admin/Manager) ────────────────
export const updateChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { title, description, categoryId, xpValue, difficulty, evidenceRequired, deadline } = req.body;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(xpValue !== undefined && { xpValue: Number(xpValue) }),
        ...(difficulty && { difficulty }),
        ...(evidenceRequired !== undefined && { evidenceRequired: Boolean(evidenceRequired) }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
    });

    res.json({ success: true, data: challenge });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADVANCE Challenge Status (Admin/Manager) ─────────
// Lifecycle: DRAFT → ACTIVE → UNDER_REVIEW → COMPLETED (or ARCHIVED anytime)
const NEXT_STATUS: Record<string, string> = {
  DRAFT: 'ACTIVE',
  ACTIVE: 'UNDER_REVIEW',
  UNDER_REVIEW: 'COMPLETED',
};

export const advanceChallengeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    let newStatus = status;
    if (!newStatus) {
      newStatus = NEXT_STATUS[challenge.status];
      if (!newStatus) {
        res.status(400).json({ success: false, message: 'Challenge is already in final state' });
        return;
      }
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: { status: newStatus as any },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ARCHIVE Challenge (Admin) ────────────────────────
export const archiveChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await prisma.challenge.update({ where: { id }, data: { status: 'ARCHIVED' } });
    res.json({ success: true, message: 'Challenge archived successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
