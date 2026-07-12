import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { getBadgesForUser, awardBadge } from '../services/badge.service';

// ── LIST all badge definitions ───────────────────────
export const listBadges = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const badges = await prisma.badge.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data: badges });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET badges for the current user (with unlock status) ─
export const getMyBadges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const badges = await getBadgesForUser(userId);
    res.json({ success: true, data: badges });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE badge definition (Admin) ─────────────────
export const createBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, iconUrl, unlockRule } = req.body;

    if (!name || !unlockRule) {
      res.status(400).json({ success: false, message: 'name and unlockRule are required' });
      return;
    }

    // Validate unlock rule
    const rule = typeof unlockRule === 'string' ? JSON.parse(unlockRule) : unlockRule;
    const validTypes = ['xp_gte', 'challenges_gte', 'csr_gte'];
    if (!validTypes.includes(rule.type) || typeof rule.value !== 'number') {
      res.status(400).json({
        success: false,
        message: 'unlockRule must be { type: "xp_gte"|"challenges_gte"|"csr_gte", value: number }',
      });
      return;
    }

    const badge = await prisma.badge.create({ data: { name, description, iconUrl, unlockRule: rule } });
    res.status(201).json({ success: true, data: badge });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE badge definition (Admin) ─────────────────
export const updateBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, description, iconUrl, unlockRule } = req.body;

    const badge = await prisma.badge.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(unlockRule && {
          unlockRule: typeof unlockRule === 'string' ? JSON.parse(unlockRule) : unlockRule,
        }),
      },
    });

    res.json({ success: true, data: badge });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE badge definition (Admin) ─────────────────
export const deleteBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await prisma.badge.delete({ where: { id } });
    res.json({ success: true, message: 'Badge deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── MANUALLY AWARD badge to user (Admin) ─────────────
export const manualAwardBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, badgeId } = req.body;
    await awardBadge(Number(userId), Number(badgeId));
    res.json({ success: true, message: 'Badge awarded manually' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
